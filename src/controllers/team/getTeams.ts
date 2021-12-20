import { Request, Response } from "express";
import { getConnection } from "typeorm";
import * as yup from "yup";
import AppError from "../../errors";
import getListItemTeamWithId from "../../utils/queries/getListItemTeamWithId";

const schema = yup.object().shape({
  page: yup.number()
    .min(1, "The page index must be at least 1")
    .integer("The page index must be an integer")
    .required("The page index is required"),
  city: yup.string()
    .uuid("The city id must be an UUID"),
  course: yup.string()
    .uuid("The course id must be an UUID"),
  team: yup.string()
});

export default async function getTeams (request: Request, response: Response) {
  const { team, course, city } = request.query;
  const page = Number(request.query.page);

  try {
    await schema.validate({ team, course, city, page });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const connection = getConnection();
  const teamsQuery = getListItemTeamWithId(connection)
    .limit(20)
    .offset(20 * (page - 1))
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

  const teams = await teamsQuery.getRawMany();

  if (teams.length === 0) {
    throw new AppError([ 404, "No teams were found" ], 2);
  }

  return response.json(teams);
}