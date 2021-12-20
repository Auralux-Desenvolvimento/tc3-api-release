import { Request, Response } from "express";
import { getConnection } from "typeorm";
import * as yup from 'yup';
import AppError from "../../errors";
import Moderator from "../../models/moderator";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import getReportWithId, { parseReportWithId } from "../../utils/queries/getReportWithId";

export enum ReportSearchType {
  pending = "pending",
  taken_over = "taken_over",
  resolved = "resolved"
}

interface ISearchParams {
  page?: number;
  type?: keyof typeof ReportSearchType;
}

const schema = yup.number()
  .integer("The page index must be an integer")
  .min(1, "The page index must be at least 1");

export default async function getAllReports (request: Request, response: Response) {
  const { page, type } = request.query as ISearchParams;
  const { user } = request.body as IAuthRequestBody<Moderator>;

  try {
    await schema.validate(page);
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const connection = getConnection();

  const reportsQuery = getReportWithId(connection)
    .limit(20)
    .offset(page ? (page - 1) * 20 : 0)
  ;
  
  switch (type) {
    case "resolved":
      reportsQuery
        .where("report.is_resolved = true")
        .andWhere("report.moderator_id = :moderatorId", { moderatorId: user.id })
      ;
      break;

    case "taken_over":
      reportsQuery
        .where("report.is_resolved = false")
        .andWhere("report.moderator_id = :moderatorId", { moderatorId: user.id })
      ;
      break;
    
    default:
    case "pending":
      reportsQuery
        .where("report.is_resolved = false")
        .andWhere("report.moderator_id IS NULL")
      ;
      break;
  }

  const reports = await reportsQuery.getRawMany<any>();

  if (reports.length <= 0) {
    throw new AppError([ 404, "No reports were found" ], 2);
  }

  for (let i in reports) {
    reports[i] = parseReportWithId(reports[i]);
  }

  response.status(200).json(reports);
}