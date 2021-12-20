import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getCustomRepository } from "typeorm";
import Moderator from "../../models/moderator";
import Team from "../../models/team";
import ModeratorRepo from "../../repos/moderator";
import TeamRepo from "../../repos/team";
import { AuthFindOptions, AuthQueryBuilder, IAuthActionList, IAuthPayload } from "./types";
import parseCookies from "./utils";

export default async function auth (
  request: Request,
  response: Response,
  next: NextFunction,
  actions: IAuthActionList,
  findOptions: AuthFindOptions | AuthQueryBuilder = {
    relations: ["user"]
  }
) {
  const cookies = parseCookies(request);
  if (cookies) {
    const token = cookies["auth_token"];
    if (!token) {
      return actions.missingAuthCookie(request, response, next);
    }

    const secret = process.env.JWT_SECRET as string;
    let payload: null | IAuthPayload = null;
    try {
      payload = verify(token, secret) as IAuthPayload;
    } catch {
      return actions.invalidToken(request, response, next);
    }

    let user: Team|Moderator|undefined;
    if (payload.moderator) {
      actions.userIsModerator(request, response, next);

      const moderatorRepo = getCustomRepository(ModeratorRepo);
      if (typeof findOptions === "object") {
        let { relations, ...newFindOptions } = findOptions;
        let newRelations = new Set([ "user", ...(relations || []) ]);
        user = await moderatorRepo.findOne({
          where: { id: payload.id },
          relations: Array.from(newRelations),
          ...(newFindOptions as AuthFindOptions<Moderator>)
        });

        if (!user) {
          return actions.invalidUser(request, response, next);
        }
      } else if (typeof findOptions === "function") {
        let moderatorQuery = moderatorRepo.createQueryBuilder("moderator")
          .innerJoinAndSelect("moderator.user", "user")
          .where("moderator.id = :id", { id: payload.id });
        moderatorQuery = (findOptions as any)(moderatorQuery);
        user = await moderatorQuery.getOne();

        if (!user) {
          return actions.invalidUser(request, response, next);
        }
      }
    } else {
      actions.userIsTeam(request, response, next);

      const teamRepo = getCustomRepository(TeamRepo);
      if (typeof findOptions === "object") {
        let { relations, ...newFindOptions } = findOptions;
        let newRelations = new Set([ "user", ...(relations || []) ]);

        user = await teamRepo.findOne({
          where: { id: payload.id },
          relations: Array.from(newRelations),
          ...newFindOptions
        });
      } else if (typeof findOptions === "function") {
        let teamQuery = teamRepo.createQueryBuilder("team")
          .innerJoinAndSelect("team.user", "user")
          .where("team.id = :id", { id: payload.id });
        teamQuery = findOptions(teamQuery);
        user = await teamQuery.getOne();
      }
      if (!user) {
        return actions.invalidUser(request, response, next);
      }

      if (!(user as Team).isActive) {
        return actions.userIsBanned(request, response, next);
      }  
    }
    
    if (!(user as any).user.isVerified) {
      actions.nonVerifiedUser(request, response, next);
    }

    return await actions.validUser(request, response, next, payload, user as any);
  } else {
    return actions.missingCookies(request, response, next);
  }
}