import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import ModKeys from "../../models/modKeys";
import ModKeysRepo from "../../repos/modKeys";

export default async function requestKey(request: Request, response: Response) {
  const moderator = request.body.user;

  const modKey = new ModKeys();
  modKey.issuer = moderator;

  const modKeyRepo = getCustomRepository(ModKeysRepo);

  await modKeyRepo.Save(modKey);
  response.status(200).json(modKey.id);
}