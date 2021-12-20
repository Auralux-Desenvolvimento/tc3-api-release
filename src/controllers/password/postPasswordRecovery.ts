import { Request, Response } from "express";
import * as yup from 'yup'
import AppError from "../../errors";
import sendRecoveryEmail from '../../utils/functions/sendEmailToRecoveryPass';

const schema = yup.object().shape({
  email: yup.string()
    .email("Invalid email")
    .required("The email is required")
});

export default async function postPasswordRecovery (request: Request, response: Response) {
  const { email } = request.body;

  try {
    await schema.validate({ email });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 3);
  }

  await sendRecoveryEmail(email);

  response.status(200).json("A link to reset the password has been sent to your email");
}