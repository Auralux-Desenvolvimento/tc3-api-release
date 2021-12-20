import { Request, Response } from "express";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import IAdvisorData from "../../../types/advisor/IAdvisorData";
import * as yup from 'yup'
import urlRegex from "../../../utils/regex/urlRegex";
import AppError from "../../../errors";
import Advisor from "../../../models/advisor";
import { getCustomRepository } from "typeorm";
import AdvisorRepo from "../../../repos/advisor";
import Nullable from "../../../types/Nullable";
import compare from "../../../utils/functions/password/compare";

const schema = yup.object().shape({
  id: yup.string()
    .uuid("Id must be an UUID")
    .required("Id is required"),
  password: yup.string()
    .required("Password is required"),
  name: yup.string()
    .min(2, "A name must be longer than 1 character")
    .max(254, "A name must have a length of up to 254 characters"),
  photoURL: yup.string()
    .matches(urlRegex, "PhotoURL must be an URL")
    .nullable(),
  email: yup.string()
    .email("An advisor email must be an email")
}).test("atLeastOne", "At least one of these values must be provided", ({ 
  name,
  photoURL,
  email
}) => (
  !!name 
  || (!!photoURL || photoURL === null) 
  || !!email
));

export default async function patchAdvisor (request: Request, response: Response) {
  let {
    name,
    photoURL,
    email,
    user: team,
    password
  } = request.body as IAuthRequestBody & Nullable<Partial<IAdvisorData>> & { password: string };
  const { id } = request.params;

  try {
    await schema.validate({ id, password, name, photoURL, email });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const result = await compare(password, team.user.password);
  if (!result) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  const advisorRepo = getCustomRepository(AdvisorRepo);
  let advisor = await advisorRepo.findOne({ id });

  if (!advisor) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  if (name) {
    advisor.name = name;
  }
  
  if (email) {
    advisor.email = email;
  }

  if (!!photoURL || photoURL === null) {
    advisor.photoURL = photoURL;
  }

  advisor = await advisorRepo.Save(advisor) as Advisor;
  delete (advisor as any).team;
  return response.json(advisor);
}