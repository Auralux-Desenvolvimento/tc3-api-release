import { Request, Response } from "express";
import { getConnection } from "typeorm";
import AppError from "../../errors";
import ModKeys from "../../models/modKeys";

export default async function countKeys (request: Request, response: Response) {
  const connection = getConnection();

  const count = await connection.createQueryBuilder()
    .select("count(modKeys.id)", "count")
    .from(ModKeys, "modKeys")
    .getCount();

  if (!count) {
    throw new AppError([ 404, "No keys were found" ], 1);
  }

  return response.json(Number(count));
}