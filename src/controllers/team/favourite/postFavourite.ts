import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../../errors";
import Favourite from '../../../models/favourite';
import FavouriteRepo from '../../../repos/favourite';
import TeamRepo from "../../../repos/team";
import IAuthRequestBody from "../../../types/IAuthRequestBody";

const schema = yup.object().shape({
  id: yup.string()
    .uuid("The subject team id must be an uuid")
    .required("The subject team id is required")
});

export default async function postFavourite (request: Request, response: Response) {
  const { id } = request.params;
  const agent = (request.body as IAuthRequestBody).user;

  try {
    await schema.validate({ id });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  if (agent.id === id) {
    throw new AppError([ 400, "You cannot favourite yourself" ], 2);
  }

  const teamRepo = getCustomRepository(TeamRepo);

  const subject = await teamRepo.findOne({id});

  if(!subject) {
    throw new AppError([ 404, "There is no team with the id indicated in the request parameters" ], 3);
  }

  const favouriteRepo = getCustomRepository(FavouriteRepo);

  const favourite = await favouriteRepo.findOne({
    where: {
      agent,
      subject
    }
  })

  if (favourite) {
    await favouriteRepo.delete({ agent: favourite.agent, subject: favourite.subject });
    return response.send();
  }

  const favouriteObj = new Favourite();
  favouriteObj.agent = agent;
  favouriteObj.subject = subject;
  
  await favouriteRepo.Save(favouriteObj);
  
  return response.status(201).send();
}
