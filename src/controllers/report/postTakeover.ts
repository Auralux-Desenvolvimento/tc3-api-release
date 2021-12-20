import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import AppError from "../../errors";
import Moderator from "../../models/moderator";
import ReportRepo from "../../repos/report";
import IAuthRequestBody from "../../types/IAuthRequestBody";

export default async function postTakeover (request: Request, response: Response) {
  const { user } = request.body as IAuthRequestBody<Moderator>;
  const { id } = request.params;

  const reportRepo = getCustomRepository(ReportRepo);
  const report = await reportRepo.findOne({
    where: { id },
    relations: [ "moderator" ]
  });

  if (!report) {
    throw new AppError([ 404, "No report was found" ], 1);
  }

  if (report.moderator) {
    throw new AppError([ 400, "The report is already taken over" ], 2);
  }

  if (report.isResolved) {
    throw new AppError([ 400, "The report was already resolved" ], 3);
  }

  report.moderator = user;
  await reportRepo.Save(report);

  return response.status(200).send();
}