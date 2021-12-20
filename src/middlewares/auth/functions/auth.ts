import { NextFunction, Request, Response } from "express";
import auth from "..";
import AppError from "../../../errors";
import { AuthFindOptions, AuthMiddleware, AuthQueryBuilder, InnerAuthMiddleware } from "../types";

const Auth: AuthMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  await InnerAuth(request, response, next);
}
export default Auth;

//accepts only verified teams
export const InnerAuth: InnerAuthMiddleware = async (
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
    validUser: (request, _response, next, _token, team) => {
      request.body.user = team;
      next();
    },
    nonVerifiedUser: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    userIsModerator: () => {
      throw new AppError(AppError.FORBIDDEN, -1);
    },
    userIsTeam: () => {
      return;
    },
    userIsBanned: () => {
      throw new AppError([ 403, "You are banned" ], -3);
    }
  }, findOptions);
}
