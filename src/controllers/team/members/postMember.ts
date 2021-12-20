import { Request, Response } from "express";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import IMemberData from "../../../types/member/IMemberData";
import * as yup from 'yup'
import urlRegex from "../../../utils/regex/urlRegex";
import AppError from "../../../errors";
import Member from "../../../models/member";
import { getCustomRepository } from "typeorm";
import MemberRepo from "../../../repos/member";
import compare from "../../../utils/functions/password/compare";

const schema = yup.object().shape({
  birthday: yup.date()
    .required("Birthday is required")
    .test("age", "A member cannot be younger than 15 years", (birthday) => {
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 15);
      return !!birthday && birthday.getTime() <= minAge.getTime();
    }),
  description: yup.string(),
  name: yup.string()
    .min(2, "A name must be longer than 1 character")
    .max(254, "A name must have a length of up to 254 characters")
    .required("Name is required"),
  photoURL: yup.string()
    .matches(urlRegex, "PhotoURL must be an URL"),
  role: yup.string()
    .max(45, "A role must have a length of up to 45 characters")
    .required("Role is required"),
  password: yup.string()
    .required("Password is required")
});

export default async function postMember (request: Request, response: Response) {
  let {
    birthday, 
    description,
    name,
    photoURL,
    role,
    user: team,
    password
  } = request.body as IAuthRequestBody & IMemberData & { password: string };

  birthday = new Date(birthday);

  try {
    await schema.validate({ birthday, description, name, photoURL, role, password });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const result = await compare(password, team.user.password);
  if (!result) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  let member = new Member();
  member.birthday = birthday;
  member.description = description;
  member.name = name;
  member.photoURL = photoURL;
  member.role = role;
  member.team = team;

  const memberRepo = getCustomRepository(MemberRepo);
  member = await memberRepo.Save(member) as Member;
  delete (member as any).team;
  return response.json(member);
}