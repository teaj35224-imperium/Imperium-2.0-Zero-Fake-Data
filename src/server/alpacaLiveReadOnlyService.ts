// Alpaca LIVE account telemetry — READ ONLY.
// This service can display real-money account/position data but intentionally exposes no order-submit method.

export interface LiveAccountSnapshot {
  connected: boolean;
  account: any | null;
  positions: any[];
  error?: string;
}

export function getAlpacaLiveReadOnlyCredentials() {
  const key = process.env.ALPACA_LIVE_API_KEY_ID || '';
  const secret = process.env.ALPACA_LIVE_API_SECRET_KEY || '';
  const baseUrl = process.env.ALPACA_LIVE_BASE_URL || 'https://api.alpaca.markets';
  const isLiveHost = baseUrl.includes('api.alpaca.markets') && !baseUrl.includes('paper-api');
  return { key, secret, baseUrl, isConfigured: Boolean(key && secret && isLiveHost) };
}

class AlpacaLiveReadOnlyService {
  public async snapshot(): Promise<LiveAccountSnapshot> {
    const creds = getAlpacaLiveReadOnlyCredentials();
    if (!creds.isConfigured) return { connected: false, account: null, positions: [] };
    try {
      const headers = {
        'APCA-API-KEY-ID': creds.key,
        'APCA-API-SECRET-KEY': creds.secret,
        'Content-Type': 'application/json'
      };
      const [accountRes, positionsRes] = await Promise.all([
        fetch(`${creds.baseUrl}/v2/account`, { headers }),
        fetch(`${creds.baseUrl}/v2/positions`, { headers })
      ]);
      if (!accountRes.ok) {
        return { connected: false, account: null, positions: [], error: `Live account HTTP ${accountRes.status}` };
      }
      return {
        connected: true,
        account: await accountRes.json(),
        positions: positionsRes.ok ? await positionsRes.json() : []
      };
    } catch (e: any) {
      return { connected: false, account: null, positions: [], error: e.message };
    }
  }
}

export const alpacaLiveReadOnlyService = new AlpacaLiveReadOnlyService();
