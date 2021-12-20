import { Response } from "express";
import { sign } from "jsonwebtoken";

export default function generateJWT (
  response: Response,
  id: string,
  moderator: boolean = false,
  secret: string = process.env.JWT_SECRET as string
) {
  const token = createJWT(id, moderator, secret);
  response.cookie("auth_token", token, { httpOnly: true, maxAge: 604800000, sameSite: "strict" });
}

export function createJWT (
  id: string,
  moderator: boolean = false,
  secret: string = process.env.JWT_SECRET as string
) {
  const token = sign(
    { id, moderator },
    secret,
    { expiresIn: "7 days" }
  );
  return token;
}