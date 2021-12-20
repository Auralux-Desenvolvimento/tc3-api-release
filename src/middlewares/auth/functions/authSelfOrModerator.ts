import { Request, Response, NextFunction } from "express";
import auth from "..";
import AppError from "../../../errors";
import { AuthFindOptions, AuthMiddleware, AuthQueryBuilder, InnerAuthMiddleware } from "../types";

const AuthSelfOrModerator: AuthMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  await InnerAuthSelfOrModerator(request, response, next);
}
export default AuthSelfOrModerator;

export const InnerAuthSelfOrModerator: InnerAuthMiddleware = async (
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
      throw new AppError(AppError.BAD_REQUEST, -1);
    },
    validUser: async (request, _response, next, _token, team) => {
      request.body.user = team;
      next();
    },
    nonVerifiedUser: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    userIsModerator: () => {
      return;
    },
    userIsTeam: () => {
      return;
    },
    userIsBanned: () => {
      throw new AppError([ 403, "You are banned" ], -3);
    }
  }, findOptions);
}