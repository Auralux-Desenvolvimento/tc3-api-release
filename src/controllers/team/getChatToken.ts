import { Request, Response } from "express";
import IAuthRequestBody from "../../types/IAuthRequestBody";
import { createJWT } from "../../utils/functions/generateJWT";

export default async function getChatToken (request: Request, response: Response) {
  const { user: team } = request.body as IAuthRequestBody;
  const token = createJWT(team.id, false, (process.env.SOCKETIO_JWT_SECRET as string));
  response.json(token);
}