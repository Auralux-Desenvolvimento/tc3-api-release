import { Request, Response } from "express";
import { getConnection, getCustomRepository } from "typeorm";
import * as yup from "yup";
import AppError from "../../../errors";
import Chat, { ChatStatus } from "../../../models/chat";
import Interest from "../../../models/interest";
import ChatRepo from "../../../repos/chat";
import InterestRepo from "../../../repos/interest";
import TeamRepo from "../../../repos/team";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import isInAgreement from "../../../utils/queries/isInAgreement";

const schema = yup.object().shape({
  id: yup.string()
    .uuid("The subject team id must be an uuid")
    .required("The subject team id is required"),
  interest: yup.boolean()
    .required("The interest state is required")
});

interface IPostInterestData extends IAuthRequestBody {
  interest: boolean;
}

export default async function postInterest (request: Request, response: Response) {
  const { id } = request.params;
  const {
    interest,
    user: agent
  } = request.body as IPostInterestData;

  try {
    await schema.validate({ id, interest });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  if (agent.id === id) {
    throw new AppError([ 400, "You cannot show interest to yourself" ], 2);
  }

  const connection = getConnection();

  const isAgentInAgreement = await isInAgreement(agent.id, connection)
    .getRawOne<{ id: string } | undefined>()
  ;
  if (isAgentInAgreement) {
    throw new AppError([ 400, "You cannot show interest to other teams while in an agreement" ], 5);
  }

  const isSubjectInAgreement = await isInAgreement(id, connection)
    .getRawOne<{ id: string } | undefined>()
  ;
  if (isSubjectInAgreement) {
    throw new AppError([ 400, "This team is already in an agreement" ], 6);
  }

  const teamRepo = getCustomRepository(TeamRepo);
  const subject = await teamRepo.findOne({ id });

  if (!subject) {
    throw new AppError([ 404, "There is no team with the id indicated in the request parameters" ], 3);
  }

  const interestRepo = getCustomRepository(InterestRepo);
  const previousInterest = await interestRepo.findOne({
    where: {
      agent,
      subject
    }
  });

  if (previousInterest) {
    throw new AppError([ 400, "This team has already been shown interest by you." ], 4);
  }

  const interestObj = new Interest();
  interestObj.agent = agent;
  interestObj.subject = subject;
  interestObj.isPositive = interest;
  
  await interestRepo.Save(interestObj);

  const reverseInterest = await interestRepo.findOne({
    where: {
      agent: subject,
      subject: agent
    }
  });

  if (reverseInterest) {
    let chat = new Chat();
    chat.team1 = agent;
    chat.team2 = subject;
    chat.status = ChatStatus.active;
    const chatRepo = getCustomRepository(ChatRepo);
    await chatRepo.Save(chat);
  }
  
  return response.status(200).json("The interest was shown");
}
