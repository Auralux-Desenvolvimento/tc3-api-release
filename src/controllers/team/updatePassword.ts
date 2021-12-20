import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import UserRepo from "../../repos/user";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import compare from "../../utils/functions/password/compare";
import hash from "../../utils/functions/password/hash";
import passwordSchema from "../../utils/schemas/passwordSchema";

interface IUpdatePassword extends IAuthRequestBody {
  oldPassword: string;
  newPassword: string;
}

const schema = yup.object().shape({
  oldPassword: passwordSchema
    .required(),
  newPassword: passwordSchema
    .required("The password is required")
});

export default async function updatePassword (request: Request, response: Response) {
  const { oldPassword, newPassword, user: team } : IUpdatePassword = request.body;

  try {
    await schema.validate({ oldPassword, newPassword });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const passwordIsValid = await compare(oldPassword, team.user.password);
  if (!passwordIsValid) {
    throw new AppError([ 400, "Invalid password" ], 2);
  }

  const isTheSamePassword = await compare(newPassword, team.user.password);
  if(isTheSamePassword) {
    throw new AppError([400, "The new password cannot be the same as the previous password"], 3);
  }

  try {
    team.user.password = await hash(newPassword);
  } catch {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  const userRepo = getCustomRepository(UserRepo);

  await userRepo.Save(team.user);

  return response.status(200).json("Password updated successfully.");
}
