export class BadRequestError extends Error {
    constructor(message = 'Bad Request') {
      const improvedMessage = message.replace(' - {', ' - Operation error messages: {');
      super(improvedMessage);
      this.name = 'BadRequestError';
      this.statusCode = 400;
    }
  }