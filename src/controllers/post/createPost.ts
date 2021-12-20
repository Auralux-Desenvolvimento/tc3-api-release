import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import Post from "../../models/post";
import PostRepo from "../../repos/post";

const schema = yup.object().shape({
  title: yup.string()
    .min(2, "A title must have a length of up to 2 characters")
    .max(254, "A title must have a length of up to 254 characters"),
  content: yup.object()
});

export default async function createPost(request: Request, response: Response) {
  const { title, content } = request.body;
  const moderator = request.body.user;

  try {
    await schema.validate({ title, content });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const postRepo = getCustomRepository(PostRepo);
  let post: Post | undefined = new Post();
  post.title = title;
  post.content = content;
  post.moderator = moderator;  
  post = await postRepo.Save(post) as Post | undefined;

  if (!post) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  return response.status(201).json(post);
}