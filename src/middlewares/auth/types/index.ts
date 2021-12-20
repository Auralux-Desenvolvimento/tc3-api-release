import { NextFunction, Request, Response } from "express";
import { SelectQueryBuilder } from "typeorm";
import { FindOneOptions } from "typeorm/find-options/FindOneOptions";
import Moderator from "../../../models/moderator";
import Team from "../../../models/team";

export interface IAuthPayload {
  id: string;
  moderator: boolean;
  iat: number;
  exp: number;
}

export type AuthFindOptions<T = Team> = Omit<FindOneOptions<T>, "where">;

export type AuthQueryBuilder<T = Team> = (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>;

export type InnerAuthMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
  findOptions?: AuthFindOptions
) => Promise<void>;

export type AuthMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

export interface IAuthActionList {
  missingCookies: AuthAction;
  missingAuthCookie: AuthAction;
  invalidToken: AuthAction;
  invalidUser: AuthAction;
  validUser: TokenHandler;
  nonVerifiedUser: AuthAction;
  invalidRequest: AuthAction;
  userIsTeam: AuthAction;
  userIsModerator: AuthAction;
  userIsBanned: AuthAction;
}

type AuthAction = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;

type TokenHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
  token: IAuthPayload,
  user: Team|Moderator
) => Promise<void>|void;