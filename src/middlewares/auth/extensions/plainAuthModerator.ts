import { NextFunction, Request, Response } from "express";
import { InnerAuthModerator } from "../functions/authModerator";

export default async function plainAuthModerator (request: Request, response: Response, next: NextFunction) {
  await InnerAuthModerator(request, response, next, {});
}