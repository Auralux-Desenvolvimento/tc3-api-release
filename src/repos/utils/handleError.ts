import { QueryFailedError } from "typeorm";
import AppError from "../../errors";
import parseClassValidatorErrors from "../../utils/functions/parseClassValidatorErrors";

export default function handleError (error: any, dbHandler?: (error: QueryFailedError & { code: number | string }) => undefined|Error) {
  debugger;
  if (process.env.NODE_ENV !== "allow-all-errors") {
    if (Array.isArray(error)) {
      const messages = parseClassValidatorErrors(error);
      throw new AppError(AppError.BAD_REQUEST, 0, messages);
    }
    switch (error.name) {
      case "QueryFailedError":
        if (dbHandler) {
          const handlerError = dbHandler(error);
          if (handlerError) {
            throw handlerError;
          }
        }
        throw new AppError([400, "DB_Error"], 0, error.code);
      case "AppError":
        throw error;
      default:
        if (process.env.NODE_ENV === "production") {
          throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
        } else {
          throw error;
        }
    }
  } else {
    throw error;
  }
}