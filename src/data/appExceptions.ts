export class AppExceptions extends Error {
  constructor(message: string | string[], name: string) {
    super(message.toString());
    this.name = name;
  }
}
