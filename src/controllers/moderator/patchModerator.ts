import passwordSchema from "../../utils/schemas/passwordSchema";
import compare from "../../utils/functions/password/compare";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import Moderator from "../../models/moderator";
import { getCustomRepository } from "typeorm";
import { Request, Response } from "express";
import UserRepo from "../../repos/user";
import AppError from "../../errors";
import * as yup from "yup";

interface IRequestData extends IAuthRequestBody<Moderator> {
  password: string;
  name: string;
}

const schema = yup.object().shape({
  password: passwordSchema
    .required("The password is required"),
  name: yup.string()
    .min(2, "A moderator name must have a length of up to 2 characters")
    .max(45, "A moderator name must have a length of up to 45 characters")
    .required("A moderator name is required")
});

export default async function patchModerator (request: Request, response: Response) {
  const { name, password, user: moderator } = request.body as IRequestData;

  try {
    await schema.validate({ name, password });
  } catch (error: any) {
    throw new AppError([400, error.errors], 1);
  }

  const correctPassword = await compare(password, moderator.user.password);
  if (!correctPassword) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  const userRepo = getCustomRepository(UserRepo);

  if (moderator.user.name === name) {
    throw new AppError([ 400, "The new name cannot be the same as the old one" ], 3);
  }
  //"patching" the team, remember to implement more validation if any other field is created
  moderator.user.name = name;

  await userRepo.Save(moderator.user);

  return response.status(200).send();
}