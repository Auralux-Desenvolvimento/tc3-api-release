import { NextFunction, Request, Response } from "express";
import { InnerNonVerifiedAuth } from "../functions/nonVerifiedAuth";

export default async function plainNonVerifiedAuth (request: Request, response: Response, next: NextFunction) {
  await InnerNonVerifiedAuth(request, response, next, {});
}