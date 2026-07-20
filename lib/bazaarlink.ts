import fs from 'fs';
import path from 'path';

const BAZAARLINK_URL = 'https://bazaarlink.ai/api/v1/chat/completions';

export const BAZAARLINK_MODELS = [
  { id: 'deepseek/deepseek-v4-flash:free', name: 'DeepSeek V4 Flash (Free)', free: true },
  { id: 'auto:free', name: 'Auto Router (Free)', free: true },
  { id: 'kimi-k3', name: 'Kimi K3 (Cheap)', free: false },
];

export function getBazaarLinkKey(): string {
  if (process.env.BAZAARLINK_API_KEY) return process.env.BAZAARLINK_API_KEY;
  try {
    const configPath = path.join(process.cwd(), '.admin-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.bazaarLinkApiKey) return config.bazaarLinkApiKey;
    }
  } catch {}
  return '';
}

export async function callBazaarLink(
  systemPrompt: string,
  userPrompt: string,
  opts: { model?: string; temperature?: number; maxTokens?: number; responseFormat?: 'json' } = {}
): Promise<string> {
  const apiKey = getBazaarLinkKey();
  if (!apiKey) throw new Error('BAZAARLINK_API_KEY environment variable is not configured');

  const model = opts.model || 'deepseek/deepseek-v4-flash:free';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const body: any = {
    model,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4096,
  };

  if (opts.responseFormat === 'json') {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(BAZAARLINK_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`BazaarLink API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}
