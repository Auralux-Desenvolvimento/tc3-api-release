import { Request, Response } from "express";
import { getConnection } from "typeorm";
import AppError from "../../errors";
import Chat from "../../models/chat";
import City from "../../models/city";
import Country from "../../models/country";
import Course from "../../models/course";
import Message from "../../models/message";
import Report from "../../models/report";
import State from "../../models/state";
import Team from "../../models/team";
import User from "../../models/user";
import IReportWithId from "../../types/report/IReportWithId";
import IListItemTeamWithId from "../../types/team/IListItemTeamWithId";

export interface IGetReportById extends IReportWithId {
  reporter?: IListItemTeamWithId;
  reported: IListItemTeamWithId;
  chatHistory?: {
    createdAt: Date;
    isActive: boolean;
    messages: {
      sender: string;
      content: string;
      createdAt: Date;
    }[];
  }
  moderatorId?: string;
  isResolved: boolean;
}

export default async function getReportById (request: Request, response: Response) {
  const { id } = request.params;

  const connection = getConnection();  
  const hasChatFK = (await connection.createQueryBuilder()
    .select("report.chat_id", "chat")
    .from(Report, "report")
    .where("report.id = :id", { id })
    .getRawOne<{ chat: string|null } | undefined>())?.chat
  ;

  let report;
  const reportQuery = connection.createQueryBuilder()
    .select("report.id", "id")
    .addSelect("report.message", "message")
    .addSelect("report.created_at", "createdAt")
    .addSelect("report.moderator_id", "moderatorId")
    .addSelect("report.is_resolved", "isResolved")

    .addSelect("report.reporter_id", "reporterId")
    .addSelect("reporter.name", "reporterName")
    .addSelect("reporterTeam.logo_url", "reporterLogoURL")
    .addSelect("reporterCourse.name", "reporterCourse")
    .addSelect("reporterTeam.theme_name", "reporterTheme")
    .addSelect("concat(reporterCity.name, ', ', reporterState.name, ' - ', reporterCountry.name)", "reporterCity")

    .addSelect("report.reported_id", "reportedId")
    .addSelect("reported.name", "reportedName")
    .addSelect("reportedTeam.logo_url", "reportedLogoURL")
    .addSelect("reportedCourse.name", "reportedCourse")
    .addSelect("reportedTeam.theme_name", "reportedTheme")
    .addSelect("concat(reportedCity.name, ', ', reportedState.name, ' - ', reportedCountry.name)", "reportedCity")

    .from(Report, "report")

    .leftJoin(Team, "reporterTeam", "reporterTeam.id = report.reporter_id")
    .leftJoin(User, "reporter", "reporter.id = reporterTeam.user_id")
    .leftJoin(Course, "reporterCourse", "reporterCourse.id = reporterTeam.course_id")
    .leftJoin(City, "reporterCity", "reporterCity.id = reporterTeam.city_id")
    .leftJoin(State, "reporterState", "reporterState.id = reporterCity.state_id")
    .leftJoin(Country, "reporterCountry", "reporterCountry.id = reporterState.country_id")

    .innerJoin(Team, "reportedTeam", "reportedTeam.id = report.reported_id")
    .innerJoin(User, "reported", "reported.id = reportedTeam.user_id")
    .innerJoin(Course, "reportedCourse", "reportedCourse.id = reportedTeam.course_id")
    .innerJoin(City, "reportedCity", "reportedCity.id = reportedTeam.city_id")
    .innerJoin(State, "reportedState", "reportedState.id = reportedCity.state_id")
    .innerJoin(Country, "reportedCountry", "reportedCountry.id = reportedState.country_id")

    .where("report.id = :id", { id })
  ;

  if (!!hasChatFK) {
    reportQuery
      .addSelect("chat.created_at", "chatHistoryCreatedAt")
      .addSelect("chat.status = 'active'", "chatHistoryIsActive")
      .addSelect("chat.id", "chatHistoryId")
      .innerJoin(Chat, "chat", "chat.id = report.chat_id")
    ;
  } 
  
  const rawReport = await reportQuery.getRawOne<any | undefined>();

  if (!rawReport) {
    throw new AppError([ 404, "No report was found" ], 1);
  }

  report = {
    id: rawReport.id,
    message: rawReport.message,
    reported: {
      city: rawReport.reportedCity,
      course: rawReport.reportedCourse,
      id: rawReport.reportedId,
      name: rawReport.reportedName,
      logoURL: rawReport.reportedLogoURL,
      theme: rawReport.reportedTheme
    },
    type: "team",
    createdAt: rawReport.createdAt,
    moderatorId: rawReport.moderatorId,
    isResolved: Boolean(rawReport.isResolved)
  } as IGetReportById;

  if (rawReport.reporterId) {
    report.reporter = {
      city: rawReport.reporterCity,
      course: rawReport.reporterCourse,
      id: rawReport.reporterId,
      name: rawReport.reporterName,
      logoURL: rawReport.reporterLogoURL,
      theme: rawReport.reporterTheme
    };
  }
  
  if (rawReport.chatHistoryId) {
    const messages = await connection.createQueryBuilder()
      .select("message.agent_id", "sender")
      .addSelect("message.content", "content")
      .addSelect("message.created_at", "createdAt")
      .from(Message, "message")
      .where("message.chat_id = :chatId", { chatId: rawReport.chatHistoryId })
      .getRawMany()
    ;
    
    report.type = "chat";
    report.chatHistory = {
      createdAt: rawReport.chatHistoryCreatedAt,
      isActive: rawReport.chatHistoryCreatedAt,
      messages
    };
  }

  return response.json(report);
}