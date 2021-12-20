import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup'
import AppError from '../../errors';
import EmailOperationRepo from '../../repos/emailOperation';
import { OperationType } from '../../models/emailOperation';
import UserRepo from '../../repos/user'; 
import compare from '../../utils/functions/password/compare';
import hash from '../../utils/functions/password/hash';

const schema = yup.object().shape({
  password: yup.string()
    .min(8, "A team password must be longer than 8 caracteres")
    .max(30, "A team password mustn't be longer than 30 character")
    .required("A team password is required")
});

export default async function newPass(request: Request, response: Response) {
  const { token } = request.params;
  const { password } = request.body;

  if(!token) {
    throw new AppError(AppError.BAD_REQUEST, 1);
  }

  try {
    await schema.validate({ password });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 2);
  }

  const emailOperationRepo = getCustomRepository(EmailOperationRepo);
  
  const emailOperation = await emailOperationRepo.findOne({
    where: {
      id: token,
      operationType: OperationType.password
    },
    relations: [
      "user"
    ]
  });

  if(!emailOperation) {
    throw new AppError([404, "The received confirm token does not exists"], 3);
  }

  const now = new Date(Date.now());
  if(emailOperation.expiryDate < now || !emailOperation.isValid) {
    throw new AppError([400, "The received confirm token has already expired"], 4);
  }

  const result = await compare(password, emailOperation.user.password);

  if(result) {
    throw new AppError([400, "The new password cannot be the same as the previous password"], 5);
  }

  emailOperation.user.password = await hash(password);
  emailOperation.isValid = false;

  const userRepo = getCustomRepository(UserRepo);

  await userRepo.Save(emailOperation.user);
  await emailOperationRepo.Save(emailOperation);

  response.status(200).json("Password changed successfully");
}