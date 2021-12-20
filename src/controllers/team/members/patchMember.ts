import { Request, Response } from "express";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import IMemberData from "../../../types/member/IMemberData";
import * as yup from 'yup'
import urlRegex from "../../../utils/regex/urlRegex";
import AppError from "../../../errors";
import Member from "../../../models/member";
import { getCustomRepository } from "typeorm";
import MemberRepo from "../../../repos/member";
import Nullable from "../../../types/Nullable";
import compare from "../../../utils/functions/password/compare";

const schema = yup.object().shape({
  id: yup.string()
    .uuid("Id must be an UUID")
    .required("Id is required"),
  password: yup.string()
    .required("Password is required"),
  birthday: yup.date()
    .test("age", "A member cannot be younger than 15 years", (birthday) => {
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 15);
      return !!birthday ? (birthday.getTime() <= minAge.getTime()) : true;
    }),
  description: yup.string()
    .nullable(),
  name: yup.string()
    .min(2, "A name must be longer than 1 character")
    .max(254, "A name must have a length of up to 254 characters"),
  photoURL: yup.string()
    .matches(urlRegex, "PhotoURL must be an URL")
    .nullable(),
  role: yup.string()
    .max(45, "A role must have a length of up to 45 characters")
}).test("atLeastOne", "At least one of these values must be provided", ({ 
  birthday, 
  description, 
  name,
  photoURL,
  role
}) => {
  let tempBirthday = birthday ? new Date(birthday) : birthday;
  return (
    !!tempBirthday
    || (!!description || description === null) 
    || !!name 
    || (!!photoURL || photoURL === null) 
    || !!role
  );
});

export default async function patchMember (request: Request, response: Response) {
  let {
    birthday, 
    description,
    name,
    photoURL,
    role,
    user: team,
    password
  } = request.body as IAuthRequestBody & Nullable<Partial<IMemberData>> & { password: string };
  const { id } = request.params;

  birthday = birthday ? new Date(birthday) : birthday;

  try {
    await schema.validate({ id, password, birthday, description, name, photoURL, role });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const result = await compare(password, team.user.password);
  if (!result) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  const memberRepo = getCustomRepository(MemberRepo);
  let member = await memberRepo.findOne({ id });

  if (!member) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  if (birthday) {
    member.birthday = birthday;
  } else {
    member.birthday = new Date(member.birthday);
  }

  if (name) {
    member.name = name;
  }
  
  if (role) {
    member.role = role;
  }

  if (!!description || description === null) {
    member.description = description;
  }

  if (!!photoURL || photoURL === null) {
    member.photoURL = photoURL;
  }

  member = await memberRepo.Save(member) as Member;
  delete (member as any).team;
  return response.json(member);
}