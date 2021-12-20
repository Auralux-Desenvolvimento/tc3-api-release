import { Request, Response } from "express";
import { getConnection } from "typeorm";
import AppError from "../../../errors";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import isInAgreement from "../../../utils/queries/isInAgreement";
import simpleSearch from "../../../utils/queries/simpleSearch";

export default async function getSearchCount (request: Request, response: Response) {
  const team = (request.body as IAuthRequestBody).user;

  const connection = getConnection();

  const inAgreement = await isInAgreement(team.id, connection)
    .getRawOne<{ id: string } | undefined>()
  ;

  if (inAgreement) {
    throw new AppError([ 400, "User is in agreement" ], 2);
  }

  const teamsQuery = (simpleSearch(team, connection))
    .select("count(*)", "count");

  let result: { count: number } | undefined = await teamsQuery.getRawOne();
  let count = result?.count;
  if (!count || count == 0 ) {
    throw new AppError([ 404, "No teams found" ], 1);
  }
  count = Number(count);

  return response.json(count);
}