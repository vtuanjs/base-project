export interface ILogger {
  info(message?: string, details?: any): void;
  error(message?: string, details?: any): void;
  warn(message?: string, details?: any): void;
  debug(message?: string, details?: any): void;
}

export interface ILoggerConfig {
  service: string;
  level?: string;
  transportsToConsole?: boolean;
  transportsToFile?: boolean;
}
