import { Connection } from "typeorm";
import Report from "../../models/report";
import Team from "../../models/team";
import User from "../../models/user";
import { ReportType } from "../../types/report/IReport";
import IReportWithId from "../../types/report/IReportWithId";

export interface IRawReport {
  id: string;
  chatId?: string|null;
  message: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reportedLogoURL?: string;
  createdAt: string;
}

export default function getReportWithId (connection: Connection) {
  const reportQuery = connection.createQueryBuilder()
    .select("report.id", "id")
    .addSelect("report.chat_id", "chatId")
    .addSelect("report.message", "message")
    .addSelect("report.reporter_id", "reporterId")
    .addSelect("reporter.name", "reporterName")
    .addSelect("report.reported_id", "reportedId")
    .addSelect("reported.name", "reportedName")
    .addSelect("reportedTeam.logo_url", "reportedLogoURL")
    .addSelect("report.created_at", "createdAt")
    
    .from(Report, "report")
    .leftJoin(Team, "reporterTeam", "reporterTeam.id = report.reporter_id")
    .leftJoin(User, "reporter", "reporter.id = reporterTeam.user_id")
    .innerJoin(Team, "reportedTeam", "reportedTeam.id = report.reported_id")
    .innerJoin(User, "reported", "reported.id = reportedTeam.user_id")
  return reportQuery;
}

export function parseReportWithId (rawReport: IRawReport): IReportWithId {
  let type: keyof typeof ReportType;
  if(!rawReport.chatId) {
    type = "team";
  } else {
    type = "chat"
  }
  return {
    id: rawReport.id,
    message: rawReport.message,
    reported: {
      id: rawReport.reportedId,
      name: rawReport.reportedName,
      logoURL: rawReport.reportedLogoURL
    },
    reporter: {
      id: rawReport.reporterId,
      name: rawReport.reporterName
    },
    type,
    createdAt: new Date(rawReport.createdAt)
  }
}