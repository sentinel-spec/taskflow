type LogMethod = (...args: unknown[]) => void;

const isProduction = process.env.NODE_ENV === "production";

const noop: LogMethod = () => {
  // Intentionally empty for disabled log levels in production.
};

export const logger: {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
} = {
  debug: isProduction ? noop : (...args) => console.debug(...args),
  info: isProduction ? noop : (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};
