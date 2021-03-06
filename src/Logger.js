import LogColors from './LogColors';

export default class Logger {
  prefix;

  constructor(prefix) {
    this.prefix = prefix;
  }

  info(message, ...optionalParams) {
    console.log(this.prefix, message, ...optionalParams);
  }

  warn(message, ...optionalParams) {
    console.warn(this.prefix, LogColors.yellow(message), ...optionalParams);
  }

  error(message, ...optionalParams) {
    const string = message.stack || message;
    console.error(this.prefix, LogColors.red(string), ...optionalParams);
  }
}
