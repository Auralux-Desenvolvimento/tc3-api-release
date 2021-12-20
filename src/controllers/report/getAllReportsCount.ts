import { Request, Response } from "express";
import { getConnection } from "typeorm";
import AppError from "../../errors";
import Moderator from "../../models/moderator";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import getReportWithId from "../../utils/queries/getReportWithId";
import { ReportSearchType } from "./getAllReports";

interface ISearchCountParams {
  type?: keyof typeof ReportSearchType;
}

export default async function getAllReportsCount (request: Request, response: Response) {
  const { type } = request.query as ISearchCountParams;
  const { user } = request.body as IAuthRequestBody<Moderator>;

  const connection = getConnection();

  const countQuery = getReportWithId(connection)
    .select("count(report.id)", "count")
  ;

  switch (type) {
    case "resolved":
      countQuery
        .where("report.is_resolved = true")
        .andWhere("report.moderator_id = :moderatorId", { moderatorId: user.id })
      ;
      break;

    case "taken_over":
      countQuery
        .where("report.is_resolved = false")
        .andWhere("report.moderator_id = :moderatorId", { moderatorId: user.id })
      ;
      break;
    
    default:
    case "pending":
      countQuery
        .where("report.is_resolved = false")
        .andWhere("report.moderator_id IS NULL")
      ;
      break;
  }

  const count = (await countQuery.getRawOne<{ count: number } | undefined>())?.count;

  if (!count) {
    throw new AppError([ 404, "No reports were found" ], 1);
  }

  return response.json(Number(count));
}