import { Request, Response } from "express";

export default async function logoff(_request: Request, response: Response) {

  response.clearCookie("auth_token", {httpOnly: true, maxAge: 0, sameSite: "strict"});

  return response.status(200).json("Logoff successful");
}