import crypto from 'crypto';

let _secret: string | null = null;
function getSecret(): string {
  if (!_secret) {
    const value = process.env.ADMIN_JWT_SECRET;
    if (!value) throw new Error('ADMIN_JWT_SECRET environment variable is required');
    _secret = value;
  }
  return _secret;
}
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';

// ─── User Types (for main app) ───
export interface User {
  email: string;
  name: string;
  password: string;
  tier: string;
  apiKey: string;
  joinedDate: string;
}

export interface HistoryItem {
  id: string;
  action: string;
  fileName?: string;
  date?: string;
  size?: string;
  timestamp: string;
  details: string;
}

const USERS_KEY = 'omnitemp_registered_users';
const HISTORY_KEY = 'omnitemp_history';

// ─── User Functions (main app) ───
export function loginUser(email: string, password?: string): User | null {
  try {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => {
      if (u.email !== email) return false;
      if (password !== undefined) return u.password === password;
      return true;
    });
    if (user) {
      localStorage.setItem('omnitemp_user', JSON.stringify(user));
      return user;
    }
    return null;
  } catch { return null; }
}

export function signupUser(name: string, email: string, password?: string): User | null {
  try {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.some(u => u.email === email)) return null;
    const newUser: User = {
      email, name, password: password || '',
      tier: 'Free Plan',
      apiKey: '',
      joinedDate: new Date().toLocaleDateString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem('omnitemp_user', JSON.stringify(newUser));
    return newUser;
  } catch { return null; }
}

export function getLoggedInUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('omnitemp_user') || 'null');
  } catch { return null; }
}

export function logoutUser(): void {
  localStorage.removeItem('omnitemp_user');
}

export function getProcessingHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function addProcessingHistory(action: string, fileName?: string, size?: string): void {
  try {
    const history = getProcessingHistory();
    history.unshift({ id: Date.now().toString(36), action, fileName, size, date: new Date().toLocaleDateString(), timestamp: new Date().toISOString(), details: '' });
    if (history.length > 100) history.length = 100;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* fail silently */ }
}

// ─── Admin Auth Functions ───
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  return crypto.scryptSync(password, salt, 64).toString('hex') === hash;
}

let cachedAdminHash: string | null = null;
function getAdminHash(): string {
  if (!cachedAdminHash) {
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envHash) {
      cachedAdminHash = envHash;
    } else if (envPassword) {
      cachedAdminHash = hashPassword(envPassword);
    } else {
      throw new Error('Either ADMIN_PASSWORD_HASH or ADMIN_PASSWORD environment variable must be set');
    }
  }
  return cachedAdminHash;
}

// ─── Admin Rate Limiting ───
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_MIN = 30;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (entry && entry.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }
  const minuteKey = `${ip}:minute`;
  const minuteEntry = loginAttempts.get(minuteKey);
  if (minuteEntry && minuteEntry.count >= MAX_REQUESTS_PER_MIN) {
    return { allowed: false, retryAfter: 60 };
  }
  if (minuteEntry && now - minuteEntry.lastAttempt < RATE_LIMIT_WINDOW) {
    minuteEntry.count++; minuteEntry.lastAttempt = now;
  } else {
    loginAttempts.set(minuteKey, { count: 1, lastAttempt: now, blockedUntil: 0 });
  }
  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, lastAttempt: 0, blockedUntil: 0 };
  entry.count++; entry.lastAttempt = now;
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION; entry.count = 0;
    addAuditLog({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      action: 'IP_BLOCKED',
      details: `IP blocked for ${BLOCK_DURATION / 60000} min`,
      ip, userAgent: 'system',
      timestamp: new Date().toISOString(),
    });
  }
  loginAttempts.set(ip, entry);
}

export function resetFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// ─── Admin Credentials ───
export function verifyCredentials(username: string, password: string): boolean {
  if (username !== ADMIN_USER) return false;
  return verifyPassword(password, getAdminHash());
}

// ─── JWT ───
export function createToken(username: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: username, iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + TOKEN_EXPIRY) / 1000),
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { valid: boolean; username?: string } {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return { valid: false };
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSig) return { valid: false };
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() >= data.exp * 1000) return { valid: false };
    return { valid: true, username: data.sub };
  } catch { return { valid: false }; }
}

// ─── Input Sanitization ───
export function sanitizeInput(input: string): string {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// ─── Audit Log ───
export interface AuditEntry {
  id: string; action: string; details: string; ip: string; userAgent: string; timestamp: string;
}

export function getAuditLog(): AuditEntry[] {
  try { return (globalThis as any).__auditLog || []; } catch { return []; }
}

export function addAuditLog(entry: AuditEntry): void {
  try {
    const log = getAuditLog();
    log.unshift(entry);
    if (log.length > 500) log.length = 500;
    (globalThis as any).__auditLog = log;
  } catch { /* fail silently */ }
}
