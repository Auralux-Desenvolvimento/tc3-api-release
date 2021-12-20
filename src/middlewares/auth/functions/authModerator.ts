import { NextFunction, Request, Response } from "express";
import auth from "..";
import AppError from "../../../errors";
import { AuthFindOptions, AuthMiddleware, AuthQueryBuilder, InnerAuthMiddleware } from "../types";

const AuthModerator: AuthMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  await InnerAuthModerator(request, response, next);
}
export default AuthModerator;

//accepts only verified moderators
export const InnerAuthModerator: InnerAuthMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
  findOptions?: AuthFindOptions | AuthQueryBuilder
) => {
  await auth(request, response, next, {
    missingCookies: () => {
      throw new AppError(AppError.UNAUTHORIZED, -1);
    },
    missingAuthCookie: () => {
      throw new AppError(AppError.UNAUTHORIZED, -1);
    },
    invalidToken: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    invalidUser: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    invalidRequest: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    validUser: (request, _response, next, _token, moderator) => {
      request.body.user = moderator;
      next();
    },
    nonVerifiedUser: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    userIsModerator: () => {
      return;
    },
    userIsTeam: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    userIsBanned: () => {
      return;
    }
  }, findOptions);
}
