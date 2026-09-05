type LogLevel = "info" | "warn" | "error" | "debug";

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
}

const levelEmoji: Record<LogLevel, string> = {
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  debug: "🔍",
};

function formatLog(entry: StructuredLog): string {
  const base = `${entry.timestamp} ${levelEmoji[entry.level]} [${entry.module}] ${entry.message}`;
  if (entry.data) {
    return `${base} ${JSON.stringify(entry.data)}`;
  }
  return base;
}

function emit(entry: StructuredLog): void {
  const formatted = formatLog(entry);

  switch (entry.level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export function createLogger(module: string) {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };
    emit(entry);
  }

  return {
    info: (message: string, data?: Record<string, unknown>) =>
      log("info", message, data),
    warn: (message: string, data?: Record<string, unknown>) =>
      log("warn", message, data),
    error: (message: string, data?: Record<string, unknown>) =>
      log("error", message, data),
    debug: (message: string, data?: Record<string, unknown>) =>
      log("debug", message, data),
  };
}
