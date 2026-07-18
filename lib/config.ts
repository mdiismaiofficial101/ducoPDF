const CONFIG_KEY = 'docupdf_admin_config';

export interface AdminConfig {
  geminiApiKey: string;
  siteUrl: string;
  siteName: string;
}

export function getAdminConfig(): AdminConfig {
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : { geminiApiKey: '', siteUrl: 'https://docupdf.com', siteName: 'DocuPDF' };
  } catch {
    return { geminiApiKey: '', siteUrl: 'https://docupdf.com', siteName: 'DocuPDF' };
  }
}

export function saveAdminConfig(config: AdminConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getGeminiApiKey(): string {
  return getAdminConfig().geminiApiKey;
}

export function hasGeminiApiKey(): boolean {
  return !!getAdminConfig().geminiApiKey;
}
