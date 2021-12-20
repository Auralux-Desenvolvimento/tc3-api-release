import { Request, Response } from "express";
import { getConnection, getCustomRepository } from "typeorm";
import AppError from "../../../errors";
import Course from "../../../models/course";
import Interest from "../../../models/interest";
import Team from "../../../models/team";
import User from "../../../models/user";
import IAuthRequestBody from "../../../types/IAuthRequestBody";

export default async function getInterest(request: Request, response: Response) {
  const team = (request.body as IAuthRequestBody).user;

  const connection = getConnection();

  const interestAgentQuery = connection.createQueryBuilder()
    .select("interest_agent.agent_id")
    .from(Interest, "interest_agent")
    .where("interest_agent.is_positive = 1")
    .andWhere("interest_agent.subject_id = :interestAgentSubject", { interestAgentSubject: team.id });

  const interestSubjectQuery = connection.createQueryBuilder()
    .select("interest_subject.subject_id")
    .from(Interest, "interest_subject")
    .where("interest_subject.is_positive = 1")
    .andWhere("interest_subject.agent_id = :interestSubjectAgent", { interestSubjectAgent: team.id });

  // Get the teams the team is interested in
  let interestedTeams = await connection.createQueryBuilder()
    .select("interest.subject_id", "id")
    .addSelect("user.name", "name")
    .addSelect("team.logo_url", "logo")
    .addSelect("course.name", "course")
    .from(Interest, "interest")
    .innerJoin(Team, "team", "team.id = interest.subject_id")
    .innerJoin(User, "user", "user.id = team.user_id")
    .innerJoin(Course, "course", "course.id = team.course_id")
    .where("interest.agent_id = :id", { id: team.id })
    .andWhere("interest.is_positive = true")
    .andWhere("team.id not in (" + interestAgentQuery.getQuery() + ")")
    .setParameters(interestAgentQuery.getParameters())
    .getRawMany() as any;
  
  for (let i = 0; i < interestedTeams.length; i++) {
    if(!interestedTeams[i].isMine) {
      interestedTeams[i].isMine = true;
    }
  }

  // Get the teams interested in the team that requested the function
  let teamsWithInterest = await connection.createQueryBuilder()
    .select("interest.agent_id", "id")
    .addSelect("user.name", "name")
    .addSelect("team.logo_url", "logo")
    .addSelect("course.name", "course")
    .from(Interest, "interest")
    .innerJoin(Team, "team", "team.id = interest.agent_id")
    .innerJoin(Course, "course", "course.id = team.course_id")
    .innerJoin(User, "user", "user.id = team.user_id")
    .where("interest.subject_id = :id", { id: team.id })
    .andWhere("interest.is_positive = true")
    .andWhere("team.id not in (" + interestSubjectQuery.getQuery() + ")")
    .setParameters(interestSubjectQuery.getParameters())
    .getRawMany() as any;

  for (let i = 0; i < teamsWithInterest.length; i++) {
    if(!teamsWithInterest[i].isMine) {
      teamsWithInterest[i].isMine = false;
    }
    interestedTeams.push(teamsWithInterest[i]);
  }

  if (interestedTeams.length <= 0) {
    throw new AppError([ 404, "No interested teams were found" ], 1);
  }

  return response.status(200).json(interestedTeams);
}