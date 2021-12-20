import { Request, Response } from "express";
import { getConnection } from "typeorm";
import * as yup from 'yup';
import AppError from "../../errors";
import Course from "../../models/course";

interface IGetCourseCountQueryParams {
  name?: string;
  page: number;
}

const schema = yup.string()
  .max(254, "The course name must be up to 254 characters long")
  .min(2, "The course name must be at least 2 characters long");

export default async function getCourseCount (request: Request, response: Response) {
  const { name: courseName } = request.query as any as IGetCourseCountQueryParams;

  try {
    await schema.validate(courseName);
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const coursesQuery = getConnection().createQueryBuilder()
    .select("count(course.id)", "count")
    .addSelect("course.name", "name")
    .from(Course, "course")
    .groupBy("course.name")
  ;

  if (courseName) {
    coursesQuery.where("course.name like :name", { name: `%${courseName}%` });
  }

  const courses = await coursesQuery.getRawOne<{ count: number }>();
  const count = Number(courses?.count);

  if (isNaN(count) || count === 0) {
    throw new AppError([ 404, "No courses were found" ], 2);
  }

  return response.json(count);
}