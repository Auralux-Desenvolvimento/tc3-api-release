import { Request, Response } from "express";
import { getConnection, getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import Moderator from "../../models/moderator";
import Post from "../../models/post";
import User from "../../models/user";
import IPostWithId from "../../types/post/IPostWIthId";

const schema = yup.object().shape({
  page: yup.number()
    .min(1, "The page index must be at least 1")
    .integer("The page index must be an integer")
    .required("The page index is required")
});

export default async function getPosts(request: Request, response: Response) {
  const page = Number(request.query.page);

  try {
    await schema.validate({ page });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const posts = await getConnection().createQueryBuilder()
    .select("post.id", "id")
    .addSelect("post.title", "title")
    .addSelect("post.content", "content")
    .addSelect("user.name", "author")
    .addSelect("post.created_at", "createdAt")
    .from(Post, "post")
    .innerJoin(Moderator, "moderator", "moderator.id = post.moderator_id")
    .innerJoin(User, "user", "user.id = moderator.user_id")
    .limit(20)
    .offset(20 * (page - 1))
    .orderBy("post.created_at")
    .getRawMany<IPostWithId[]>();

  if(posts.length <= 0) {
    throw new AppError([ 404, "No posts found" ], 2);
  }

  return response.status(200).json(posts);
}