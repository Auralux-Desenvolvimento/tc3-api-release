import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import TeamRepo from "../../repos/team";

const schema = yup.object().shape({
  id: yup.string()
    .uuid("Invalid teamId")
});

export default async function banTeam(request: Request, response: Response) {
  const { id } = request.params;

  try {
    await schema.validate({ id });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const teamRepo = getCustomRepository(TeamRepo);
  const team = await teamRepo.findOne({ id });

  if(!team) {
    throw new AppError([ 404, "A team with this id was not found" ], 2);
  }

  if(!team.isActive) {
    throw new AppError([ 400, "This team has already been banned" ], 3);
  }

  team.isActive = false;

  await teamRepo.Save(team);
  response.status(200).json("Success");
}