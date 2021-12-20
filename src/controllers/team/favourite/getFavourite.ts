import { Request, Response } from "express";
import { getConnection } from "typeorm";
import AppError from "../../../errors";
import City from "../../../models/city";
import Country from "../../../models/country";
import Course from "../../../models/course";
import Favourite from "../../../models/favourite";
import State from "../../../models/state";
import Team from "../../../models/team";
import User from "../../../models/user";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import getListItemTeamWithId from "../../../utils/queries/getListItemTeamWithId";

export default async function getFavourite (request: Request, response: Response) {
  const team = (request.body as IAuthRequestBody).user;

  const connection = getConnection()
  const favourites = await getListItemTeamWithId(connection)
    .innerJoin(Favourite, "favourite", "favourite.subject_id = team.id")
    .where("favourite.agent_id = :id", {id: team.id})
    .getRawMany();

  if (favourites.length <= 0) {
    throw new AppError([ 404, "No favourite team found" ], 1);
  }
  
  return response.status(200).json(favourites);
}