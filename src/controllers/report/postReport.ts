import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import Report from "../../models/report";
import ChatRepo from "../../repos/chat";
import ReportRepo from "../../repos/report";
import TeamRepo from "../../repos/team";
import IAuthRequestBody from "../../types/IAuthRequestBody";

interface IPostReportData {
  reportedId: string;
  chatId?: string;
  message: string;
}

const schema = yup.object().shape({
  chatId: yup.string()
    .uuid("Invalid chatId"),
  reportedId: yup.string()
    .uuid("Invalid reportedId")
    .required("The reportedId is required"),
  message: yup.string()
    .required("The message is required")
});


export default async function postReport (request: Request, response: Response) {
  const team = (request.body as IAuthRequestBody).user;
  const { reportedId, chatId, message } : IPostReportData = request.body;

  try {
    await schema.validate({ reportedId, chatId, message });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }
  
  const teamRepo = getCustomRepository(TeamRepo);

  const reportedTeam = await teamRepo.findOne({
    where: {
      id: reportedId
    }
  })

  if(!reportedTeam) {
    throw new AppError([ 404, "The reported team does not exists." ], 2);
  }

  const report = new Report();

  report.reporterTeam = team;
  report.reportedTeam = reportedTeam;
  report.message = message;

  if(chatId) {
    const chatRepo = getCustomRepository(ChatRepo);
    const reportedChat = await chatRepo.findOne({
      where: {
        id: chatId
      }
    });

    if(!reportedChat) {
      throw new AppError([ 404, "The reported chat does not exists." ], 3);
    }
    
    report.chat = reportedChat;
  }

  const reportRepo = getCustomRepository(ReportRepo);

  await reportRepo.Save(report);

  response.status(201).json("The report was successfully sent");
}