import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import PostRepo from "../../repos/post";

const schema = yup
  .string()
  .uuid("The team's id must be uuid")
  .required("The team's id is required");

export default async function deletePost(request: Request, response: Response) {
  const { id } = request.params;

  try {
    await schema.validate(id)
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const postRepo = getCustomRepository(PostRepo);

  await postRepo.delete({id: id});
  return response.status(200).json("The post was successfully deleted");
}