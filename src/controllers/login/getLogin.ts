import { NextFunction, Request, Response } from "express";
import { getConnection, getCustomRepository } from "typeorm";
import AppError from "../../errors";
import auth from "../../middlewares/auth";
import { InnerAuthMiddleware } from "../../middlewares/auth/types";
import Moderator from "../../models/moderator";
import Team from "../../models/team";
import TeamRepo from "../../repos/team";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import IModeratorData from "../../types/moderator/IModeratorData";
import IUserTeamData from "../../types/team/IUserTeamData";
import getModeratorData from "../../utils/queries/getModeratorData";
import isInAgreement from "../../utils/queries/isInAgreement";

export const getLoginAuth: InnerAuthMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
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
      return;
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
  });
}

export default async function getLogin (request: Request, response: Response) {
  const { user } = request.body as IAuthRequestBody<Team|Moderator>;
  let responseValue: IUserTeamData|IModeratorData|undefined;
  const connection = getConnection();

  if (user instanceof Moderator) {
    responseValue = await getModeratorData(connection)
      .where("moderator.id = :id", { id: user.id })
      .getRawOne<IModeratorData>()
    ;
    if (!responseValue) {
      throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
    }
    responseValue.isModerator = true;
  } else {
    const teamRepo = getCustomRepository(TeamRepo);
    const team = await teamRepo.findOne({
      join: {
        alias: "team",
        innerJoinAndSelect: {
          course: "team.course",
          city: "team.city",
          state: "city.state",
          country: "state.country",
          members: "team.members",
          user: "team.user",
          advisor: "team.advisors"
        },
        leftJoinAndSelect: {
          preferences: "team.preferences",
        }
      },
      where: { id: user.id }
    });

    if (!team) {
      throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
    }

    const inAgreement = !!(await isInAgreement(team.id, connection).getRawOne());

    responseValue = {
     id: team.id,
     name: team.user.name,
     logoURL: team.logoURL,
     course: team.course.name,
     theme: team.themeName,
     themeDescription: team.themeDescription,
     city: `${team.city.name}, ${team.city.state.name} - ${team.city.state.country.name}`,
     portfolio: team.portfolio,
     isVerified: !!team.user.isVerified,
     hasPreferences: team.preferences.length > 0,
     members: team.members,
     advisors: team.advisors,
     isInAgreement: inAgreement
   };
  }

  response.json(responseValue);
}