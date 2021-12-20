import { NextFunction, Request, Response } from "express";
import { InnerAuthSelfOrModerator } from "../functions/authSelfOrModerator";

export default async function plainAuthSelfOrModerator (request: Request, response: Response, next: NextFunction) {
  await InnerAuthSelfOrModerator(request, response, next, {});
}