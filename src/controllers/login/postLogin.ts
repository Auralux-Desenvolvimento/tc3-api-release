import { Request, Response } from "express";
import * as yup from 'yup'
import AppError from "../../errors";
import generateJWT from "../../utils/functions/generateJWT";
import passwordSchema from "../../utils/schemas/passwordSchema";
import tryLogin from "../../utils/functions/tryLogin";

interface ILoginData {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string()
    .email("Invalid email")
    .required("The email is required"),
  password: passwordSchema
    .required("The password is required")
});

export default async function postLogin (request: Request, response: Response) {
  const { email, password }: ILoginData = request.body;

  try {
    await schema.validate({ email, password });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const user = await tryLogin(email, password);

  if (user) {
    if ((user as any).isActive === false) {
      throw new AppError([ 403, "You are banned" ], -3);
    } else if ((user as any).isActive === true) {
      delete (user as any).isActive;
    }

    generateJWT(response, user.id, (user as any).isModerator);
    return response.json(user);
  } else {
    throw new AppError([ 400, "Invalid credentials" ], 2);
  }
}