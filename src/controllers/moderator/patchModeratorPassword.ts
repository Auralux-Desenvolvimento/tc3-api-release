import { Request, Response } from "express";
import Moderator from "../../models/moderator";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import * as yup from "yup";
import passwordSchema from "../../utils/schemas/passwordSchema";
import AppError from "../../errors";
import compare from "../../utils/functions/password/compare";
import hash from "../../utils/functions/password/hash";
import { getCustomRepository } from "typeorm";
import UserRepo from "../../repos/user";

interface IRequestData extends IAuthRequestBody<Moderator> {
  oldPassword: string;
  newPassword: string;
}

const schema = yup.object().shape({
  oldPassword: passwordSchema
    .required("The old password is required"),
  newPassword: passwordSchema
    .required("The new password is required"),
});

export default async function patchModeratorPassword (request: Request, response: Response) {
  const { newPassword, oldPassword, user: moderator } = request.body as IRequestData;

  try {
    await schema.validate({ newPassword, oldPassword });
  } catch (error: any) {
    throw new AppError([400, error.errors], 1);
  }

  const correctPassword = await compare(oldPassword, moderator.user.password);
  if (!correctPassword) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }
  
  const isTheSamePassword = await compare(newPassword, moderator.user.password);
  if(isTheSamePassword) {
    throw new AppError([400, "The new password cannot be the same as the previous password"], 3);
  }

  try {
    moderator.user.password = await hash(newPassword);
  } catch {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  const userRepo = getCustomRepository(UserRepo);
  await userRepo.Save(moderator.user);

  return response.status(200).json("Password updated successfully.");
}