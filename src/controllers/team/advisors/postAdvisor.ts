import { Request, Response } from "express";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import IAdvisorData from "../../../types/advisor/IAdvisorData";
import * as yup from 'yup'
import urlRegex from "../../../utils/regex/urlRegex";
import AppError from "../../../errors";
import Advisor from "../../../models/advisor";
import { getCustomRepository } from "typeorm";
import AdvisorRepo from "../../../repos/advisor";
import compare from "../../../utils/functions/password/compare";

const schema = yup.object().shape({
  name: yup.string()
    .min(2, "A name must be longer than 1 character")
    .max(254, "A name must have a length of up to 254 characters")
    .required("Name is required"),
  photoURL: yup.string()
    .matches(urlRegex, "PhotoURL must be an URL"),
  email: yup.string()
    .email("An advisor email must be an email"),
  password: yup.string()
    .required("Password is required")
});

export default async function postAdvisor (request: Request, response: Response) {
  let {
    name,
    photoURL,
    email,
    user: team,
    password
  } = request.body as IAuthRequestBody & IAdvisorData & { password: string };

  try {
    await schema.validate({ name, photoURL, email, password });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const result = await compare(password, team.user.password);
  if (!result) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  let advisor = new Advisor();
  advisor.name = name;
  advisor.photoURL = photoURL;
  advisor.email = email;
  advisor.team = team;

  const advisorRepo = getCustomRepository(AdvisorRepo);
  advisor = await advisorRepo.Save(advisor) as Advisor;
  delete (advisor as any).team;
  return response.json(advisor);
}