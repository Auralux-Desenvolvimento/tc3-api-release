import { Request, Response } from "express";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import IMemberData from "../../types/member/IMemberData";
import * as yup from 'yup'
import passwordSchema from "../../utils/schemas/passwordSchema";
import memberSchema from "../../utils/schemas/memberSchema";
import AppError from "../../errors";
import { getCustomRepository } from "typeorm";
import CityRepo from "../../repos/city";
import CourseRepo from "../../repos/course";
import Member from "../../models/member";
import TeamRepo from "../../repos/team";
import MemberRepo from "../../repos/member";
import Course from "../../models/course";
import UserRepo from "../../repos/user";
import advisorSchema from "../../utils/schemas/advisorSchema";
import IAdvisorData from "../../types/advisor/IAdvisorData";
import Advisor from "../../models/advisor";
import AdvisorRepo from "../../repos/advisor";
import IDraftContent from "../../types/portfolio/IDraftContent";
import compare from "../../utils/functions/password/compare";

interface IPatchTeamData extends IAuthRequestBody {
  name?: string,
  logoURL?: string|null,
  password: string,
  course?: string,
  city?: string,
  theme?: string|null,
  members?: IMemberData[],
  advisors?: IAdvisorData[],
  portfolio?: IDraftContent|null,
  themeDescription?: string|null
}

const schema = yup.object().shape({
  name: yup.string()
    .max(50, "A team name must have a length of up to 50 characters"),
  logoURL: yup.string()
    .url("A tem logo url must be an url")
    .nullable(),
  password: passwordSchema
    .required("A team password is required"),
  course: yup.string(),
  city: yup.string()
    .uuid("A team city must be an uuid"),
  theme: yup.string()
    .nullable(),
  themeDescription: yup.string()
    .nullable(),
  members: yup.array()
    .of(memberSchema)
    .min(1, "Minimum of one member"),
  advisors: yup.array()
    .of(advisorSchema)
    .min(1, "Minimum of one advisor"),
  portfolio: yup.object()
    .nullable()
}).test("atLeastOne", "At least one of these values must be provided", ({ 
  city,
  course,
  logoURL,
  members,
  name,
  portfolio,
  theme,
  themeDescription,
  advisors
}) => {
  return (
    !!city
    || !!course
    || !!members
    || !!advisors
    || !!name
    || (!!logoURL || logoURL === null)
    || (!!portfolio || portfolio === null)
    || (!!theme || theme === null)
    || (!!themeDescription || themeDescription === null)
  );
});;

export default async function patchTeam (request: Request, response: Response) {
  let { 
    password,
    user: team,
    city,
    course,
    logoURL,
    members,
    advisors,
    name,
    portfolio,
    theme,
    themeDescription
  } = request.body as IPatchTeamData;

  if (members) {
    members = members?.map(e => {
      e.birthday = new Date(e?.birthday);
      return e;
    });
  }

  try {
    await schema.validate({ password, city, course, logoURL, members, name, portfolio, theme, themeDescription, advisors });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const result = await compare(password, team.user.password);
  if (!result) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  if (city) {
    const cityRepo = getCustomRepository(CityRepo);
    const newCity = await cityRepo.findOne({ id: city });
    if (!newCity) {
      throw new AppError([ 400, "Inexistent city" ], 3);
    }
    team.city = newCity;
  }

  if (course) {
    const courseRepo = getCustomRepository(CourseRepo);
    let newCourse = await courseRepo.findOne({ name: course });
    if (!newCourse) {
      newCourse = new Course();
      newCourse.name = course;
      newCourse = await courseRepo.Save(newCourse) as Course;
    }
    team.course = newCourse;
  }

  if (logoURL || logoURL === null) {
    team.logoURL = logoURL;
  }

  if (members) {
    const newMembers: Member[] = members.map(e => {
      const member = new Member();
      member.birthday = e.birthday;
      member.description = e.description;
      member.name = e.name;
      member.photoURL = e.photoURL;
      member.role = e.role;
      member.team = team;  
      return member;
    });
    const memberRepo = getCustomRepository(MemberRepo);
    await memberRepo.delete({ team });
    await memberRepo.Save(newMembers);
    team.members = newMembers;
  }

  if (advisors) {
    const newAdvisors: Advisor[] = advisors.map(e => {
      const advisor = new Advisor();
      advisor.name = e.name;
      advisor.photoURL = e.photoURL;
      advisor.email = e.email;
      advisor.team = team;  
      return advisor;
    });
    const advisorRepo = getCustomRepository(AdvisorRepo);
    await advisorRepo.delete({ team });
    await advisorRepo.Save(newAdvisors);
    team.advisors = newAdvisors;
  }

  let user;
  if (name) {
    user = team.user;
    user.name = name;
  }

  if (portfolio || portfolio === null) {
    team.portfolio = portfolio;
  }

  if (theme || theme === null) {
    team.themeName = theme;
  }

  if (themeDescription || themeDescription === null) {
    team.themeDescription = themeDescription;
  }

  const teamRepo = getCustomRepository(TeamRepo);
  try {
    await teamRepo.Save(team);
  } catch (err: any) {
    const error: AppError = err;
    if (error.operationCode === -999) {
      error.operationCode = 4;
    }
    throw error;
  }

  if (user) {
    const userRepo = getCustomRepository(UserRepo)
    await userRepo.Save(user);
  }

  return response.status(200).send();
}