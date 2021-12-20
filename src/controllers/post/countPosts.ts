import { Request, Response } from "express";
import { getConnection } from "typeorm";
import AppError from "../../errors";
import Post from "../../models/post";

export default async function countPosts (request: Request, response: Response) {
  const connection = getConnection();

  const count = await connection.createQueryBuilder()
    .select("count(post.id)", "count")
    .from(Post, "post")
    .getCount();

  if (!count) {
    throw new AppError([ 404, "No posts were found" ], 1);
  }

  return response.json(Number(count));
}