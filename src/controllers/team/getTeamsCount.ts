import { Request, Response } from "express";
import { getConnection } from "typeorm";
import * as yup from "yup";
import AppError from "../../errors";
import getListItemTeamWithId from "../../utils/queries/getListItemTeamWithId";

const schema = yup.object().shape({
  city: yup.string()
    .uuid("The city id must be an UUID"),
  course: yup.string()
    .uuid("The course id must be an UUID"),
  team: yup.string()
});

export default async function getTeamsCount (request: Request, response: Response) {
  const { team, course, city } = request.query;

  try {
    await schema.validate({ team, course, city });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const connection = getConnection();
  const teamsQuery = getListItemTeamWithId(connection)
    .select("count(team.id)", "count")
  ;

  if (team) {
    teamsQuery.andWhere("user.name like :name", { name: `%${team}%` });
  }

  if (course) {
    teamsQuery.andWhere("course.id = :course", { course });
  }

  if (city) {
    teamsQuery.andWhere("city.id = :city", { city });
  }

  const teams = Number((await teamsQuery.getRawOne())?.count);

  if (!teams) {
    throw new AppError([ 404, "No teams were found" ], 2);
  }

  return response.json(teams);
}