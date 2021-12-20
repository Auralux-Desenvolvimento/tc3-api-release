export default class AppError extends Error {
  public code: number;
  public operationCode: number;
  public details: any;

  constructor ([ code, message ]: [ number, string ], operationCode: number, details: any = null) {
    super(message);
    this.code = code;
    this.operationCode = operationCode;
    this.name = "AppError";
    this.details = details;
  }

  public getLiteral (): IAppErrorLiteral {
    return {
      code: this.operationCode,
      details: this.details,
      message: this.message
    };
  }

  static BAD_REQUEST = [ 400, "Bad Request" ] as [ number, string ];
  static UNAUTHORIZED = [ 401, "Missing Auth Token" ] as [ number, string ];
  static FORBIDDEN = [ 403, "Forbidden" ] as [ number, string ];
  static NOT_FOUND = [ 404, "Not Found" ] as [ number, string ];
  static INTERNAL_SERVER_ERROR = [ 500, "Internal Server Error" ] as [ number, string ];
}

export interface IAppErrorLiteral<T = any> {
  message: string;
  details?: T;
  code: number;
}

export const INTERNAL_SERVER_ERROR: IAppErrorLiteral = {
  code: 0,
  message: "Internal Server Error"
}