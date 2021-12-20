import { Request, Response } from "express";
import { getConnection, getCustomRepository } from "typeorm";
import AppError from "../../../errors";
import Country from "../../../models/country";
import Member from "../../../models/member";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import ICompleteTeamData from "../../../types/team/ICompleteTeamData";
import * as yup from 'yup';
import simpleSearch from "../../../utils/queries/simpleSearch";
import FavouriteRepo from "../../../repos/favourite";
import Advisor from "../../../models/advisor";
import isInAgreement from "../../../utils/queries/isInAgreement";

interface ISearchParams {
  page?: number;
}

const schema = yup.number()
  .integer("The page index must be an integer")
  .min(1, "The page index must be at least 1");

export default async function getSearch (request: Request, response: Response) {
  const { user: team } = request.body as IAuthRequestBody;
  const { page } = request.query as ISearchParams;
  try {
    await schema.validate(page);
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const connection = getConnection();

  const inAgreement = !!(await isInAgreement(team.id, connection).getRawOne());

  if (inAgreement) {
    throw new AppError([ 400, "User is in agreement" ], 2);
  }

  let teamsQuery;
  try {
    teamsQuery = (simpleSearch(team, connection))
      .select("team.id", "id")
      .addSelect("user.name", "name")
      .addSelect("team.logo_url", "logoURL")
      .addSelect("\"course\".\"name\"", "course")
      .addSelect("team.theme_name", "theme")
      .addSelect("concat(city.name, ', ', state.name, ' - ', country.name)", "city")
      .addSelect("team.theme_description", "themeDescription")
      .addSelect("team.portfolio", "portfolio")
      .innerJoin(Country, "country", "country.id = state.country_id")
      .addGroupBy("course.name")
      .addGroupBy("user.name")
      .addGroupBy("city.name")
      .addGroupBy("state.name")
      .addGroupBy("country.name")
      .limit(20)
      .offset(page ? (page - 1) * 20 : 0);
  } catch (rawError: any) {
    const error: AppError = rawError;
    error.operationCode = 2;
    throw error;
  }

  let teams: ICompleteTeamData[] = await teamsQuery.getRawMany();

  if (teams.length === 0) {
    throw new AppError([ 404, "No teams found" ], 3);
  }

  const favouriteRepo = getCustomRepository(FavouriteRepo);
  for (let currentTeam of teams) {
    const favourite = await favouriteRepo.findOne({
      where: {
        agent: team,
        subject: currentTeam
      }
    });

    if (favourite) {
      currentTeam.isFavourite = true;
    } else {
      currentTeam.isFavourite = false;
    }
  }

  for (let resultTeam of teams) {
    resultTeam.members = await connection.createQueryBuilder()
      .select("member.id", "id")
      .addSelect("member.name", "name")
      .addSelect("member.photo_url", "photoURL")
      .addSelect("member.role", "role")
      .addSelect("member.birthday", "birthday")
      .addSelect("member.description", "description")
      .from(Member, "member")
      .where("member.team_id = :id", { id: resultTeam.id })
      .getRawMany();

    resultTeam.advisors = await connection.createQueryBuilder()
      .select("advisor.id", "id")
      .addSelect("advisor.name", "name")
      .addSelect("advisor.photo_url", "photoURL")
      .from(Advisor, "advisor")
      .where("advisor.team_id = :id", { id: resultTeam.id })
      .getRawMany();
  }

  return response.json(teams);
}