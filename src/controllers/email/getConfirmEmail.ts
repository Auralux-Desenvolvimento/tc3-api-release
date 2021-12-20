import { Request, Response } from "express";
import AppError from "../../errors";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import sendConfirmationEmail from "../../utils/functions/sendConfirmationEmail";

export default async function getConfirmEmail (request: Request, response: Response) {
  const { user } = request.body as IAuthRequestBody;

  if(!user) {
    throw new AppError([403, "The user is not authenticated"], 3);
  }

  await sendConfirmationEmail(user.user);

  response.status(200).json("Confirmation email has been sent");
}