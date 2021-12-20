import { Request, Response } from "express";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import { getCustomRepository } from "typeorm";
import AdvisorRepo from "../../../repos/advisor";
import AppError from "../../../errors";
import * as yup from 'yup'
import compare from "../../../utils/functions/password/compare";
import passwordSchema from "../../../utils/schemas/passwordSchema";

interface IDeleteAdvisorData extends IAuthRequestBody {
  password: string;
}

const schema = yup.object().shape({
  id: yup.string()
    .uuid("Id must be an UUID")
    .required("Id is required"),
  password: passwordSchema
    .required("Password is required")
})


export default async function deleteAdvisor (request: Request, response: Response) {
  const { id } = request.params;
  const { user: team, password } = request.body as IDeleteAdvisorData;

  try {
    await schema.validate({ id, password });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const result = await compare(password, team.user.password);
  if (!result) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  const advisorRepo = getCustomRepository(AdvisorRepo);
  await advisorRepo.delete({ id: id, team: team });

  return response.status(200).send();
}