import { NextFunction, Request, Response } from "express";
import { Brackets, getConnection, getCustomRepository } from "typeorm";
import AppError from "../../errors";
import City from "../../models/city";
import Country from "../../models/country";
import Course from "../../models/course";
import Member from "../../models/member";
import State from "../../models/state";
import Team from "../../models/team";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import * as yup from "yup";
import FavouriteRepo from "../../repos/favourite";
import InterestRepo from "../../repos/interest";
import User from "../../models/user";
import Advisor from "../../models/advisor";
import AgreementRepo from "../../repos/agreement";
import auth from "../../middlewares/auth";
import { InnerAuthMiddleware } from "../../middlewares/auth/types";
import TeamRepo from "../../repos/team";
import Moderator from "../../models/moderator";

export const getTeamByIdAuth: InnerAuthMiddleware = async (
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
    validUser: async (request, _response, next, token, team) => {
      const { id: subjectId } = request.params;
      
      if (!subjectId) {
        throw new AppError(AppError.FORBIDDEN, -1);
      }

      const teamRepo = getCustomRepository(TeamRepo);  
      const subject = await teamRepo.findOne({
        where: { id: subjectId },
      });

      if (!subject) {
        throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
      }
      
      if (!token.moderator) {  
        const interestRepo = getCustomRepository(InterestRepo);

        const isInterested = await interestRepo.createQueryBuilder("interest")
          .where(new Brackets(qb => {
            qb.where("interest.agent_id = :teamId", { teamId: team.id })
              .andWhere("interest.subject_id = :subjectId", { subjectId: subject.id })
          }))
          .orWhere(new Brackets(qb => {
            qb.where("interest.agent_id = :teamId2", { teamId2: subject.id })
              .andWhere("interest.subject_id = :subjectId2", { subjectId2: team.id })
          }))
          .getOne();

        const favouriteRepo = getCustomRepository(FavouriteRepo);
        const isFavourite = await favouriteRepo.findOne({
          where: { 
            agent: team, 
            subject
          }
        });
  
        if (!isInterested && !isFavourite) {
          throw new AppError([400, "It is not possible to obtain the data of a team by ID of a team that in no way has interacted with another"], -1);
        }
      }
      request.body.subject = subject;
      request.body.user = team;
      return next();
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
  });
}

const schema = yup
  .string()
  .uuid("The team's id must be uuid")
  .required("The team's id is required");

export default async function getTeamById(request: Request, response: Response) {
  const { id } = request.params;
  const agent = (request.body as IAuthRequestBody).user;

  try {
    await schema.validate(id);
  } catch (error: any) {
    throw new AppError([400, error.errors], 1);
  }

  const connection = getConnection();

  const team = await connection
    .createQueryBuilder()
    .select("team.id", "id")
    .addSelect("user.name", "name")
    .addSelect("team.logo_url", "logoURL")
    .addSelect("course.name", "course")
    .addSelect("team.theme_name", "theme")
    .addSelect(
      "concat(city.name, ', ', state.name, ' - ', country.name)",
      "city"
    )
    .addSelect("team.theme_description", "themeDescription")
    .addSelect("team.portfolio", "portfolio")
    .addSelect("team.is_active", "isActive")
    .from(Team, "team")
    .innerJoin(User, "user", "user.id = team.user_id")
    .innerJoin(Course, "course", "course.id = team.course_id")
    .innerJoin(City, "city", "city.id = team.city_id")
    .innerJoin(State, "state", "state.id = city.state_id")
    .innerJoin(Country, "country", "country.id = state.country_id")
    .where("team.id = :id", { id })
    .getRawOne();

  if (!team) {
    throw new AppError([404, "No teams found"], 2);
  }

  const interestRepo = getCustomRepository(InterestRepo);
  const isInterested = await interestRepo.findOne({
    where: {
      agent,
      subject: team
    }
  });

  const favouriteRepo = getCustomRepository(FavouriteRepo);
  const favourite = await favouriteRepo.findOne({
    where: {
      agent,
      subject: team,
    },
  });

  if (favourite) {
    team.isFavourite = true;
  } else {
    team.isFavourite = false;
  }

  if (isInterested) {
    team.isInterested = true;
  } else {
    team.isInterested = false;
  }

  team.members = await connection
    .createQueryBuilder()
    .select("member.id", "id")
    .addSelect("member.name", "name")
    .addSelect("member.photo_url", "photoURL")
    .addSelect("member.role", "role")
    .addSelect("member.birthday", "birthday")
    .addSelect("member.description", "description")
    .from(Member, "member")
    .where("member.team_id = :id", { id })
    .getRawMany();

  let agreement;
  if (agent instanceof Moderator) {
    agreement = true;
  } else {
    const agreementRepo = getCustomRepository(AgreementRepo);
    agreement = await agreementRepo.createQueryBuilder("agreement")
      .innerJoin("agreement.chat", "chat")
      .where(new Brackets(qb => {
        qb.where("chat.team1_id in (:...teams1)", { teams1: [ agent.id, id ] })
          .orWhere("chat.team2_id in (:...teams2)", { teams2: [ agent.id, id ] });
      }))
      .where("agreement.status = 'active'")
      .getOne()
    ;  
  }

  const teamAdvisorsQuery = connection
    .createQueryBuilder()
    .select("advisor.id", "id")
    .addSelect("advisor.name", "name")
    .addSelect("advisor.photo_url", "photoURL")
    .from(Advisor, "advisor")
    .where("advisor.team_id = :id", { id })
  ;

  if (!!agreement) {
    teamAdvisorsQuery
      .addSelect("advisor.email", "email");
  }

  team.advisors = await teamAdvisorsQuery.getRawMany();

  return response.json(team);
}