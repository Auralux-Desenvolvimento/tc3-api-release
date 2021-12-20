import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import AppError from "../../errors";
import { OperationType } from "../../models/emailOperation";
import EmailOperationRepo from "../../repos/emailOperation";
import UserRepo from "../../repos/user";

export default async function getConfirmEmailToken (request: Request, response: Response) {
  const { token } = request.params;

  if(!token) {
    throw new AppError(AppError.BAD_REQUEST, 1);
  }

  const emailOperationRepo = getCustomRepository(EmailOperationRepo);

  const emailOperation = await emailOperationRepo.findOne({
    where: {
      id: token,
      operationType: OperationType.email
    },
    relations: [
      "user"
    ]
  });

  if(!emailOperation) {
    throw new AppError([404, "The received confirm token does not exists"], 2);
  }

  const now = new Date(Date.now());
  if(emailOperation.expiryDate < now || !emailOperation.isValid) {
    throw new AppError([400, "The received confirm token has already expired"], 3);
  }

  emailOperation.isValid = false;
  emailOperation.user.isVerified = true;

  const userRepo = getCustomRepository(UserRepo);

  await userRepo.Save(emailOperation.user);
  await emailOperationRepo.Save(emailOperation);

  response.status(200).json("The email was validated");
}