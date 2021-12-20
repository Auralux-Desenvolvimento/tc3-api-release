import { Request, Response, NextFunction } from "express";
import { InnerAuth } from "../functions/auth";

export default async function credentialsAuth (
  request: Request, 
  response: Response, 
  next: NextFunction
) {
  await InnerAuth(request, response, next, {
    relations: [ "user" ]
  });
}