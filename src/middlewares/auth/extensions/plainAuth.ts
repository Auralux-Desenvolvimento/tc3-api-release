import { NextFunction, Request, Response } from "express";
import { InnerAuth } from "../functions/auth";

export default async function plainAuth (request: Request, response: Response, next: NextFunction) {
  await InnerAuth(request, response, next, {});
}