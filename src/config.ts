import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const config = {
  supabase: {
    url: requireEnv("SUPABASE_URL"),
    serviceKey: requireEnv("SUPABASE_SERVICE_KEY"),
  },
  telegram: {
    botToken: requireEnv("TELEGRAM_BOT_TOKEN"),
    cfoChatId: requireEnv("TELEGRAM_CFO_CHAT_ID"),
  },
  dodo: {
    apiKey: requireEnv("DODO_API_KEY"),
    baseUrl: optionalEnv("DODO_BASE_URL", "https://api.dodo.dev"),
  },
  server: {
    port: parseInt(optionalEnv("PORT", "3000"), 10),
    nodeEnv: optionalEnv("NODE_ENV", "development"),
  },
  policy: {
    autoApproveThresholdCents: parseInt(
      optionalEnv("AUTO_APPROVE_THRESHOLD_CENTS", "50000"),
      10
    ),
  },
} as const;
