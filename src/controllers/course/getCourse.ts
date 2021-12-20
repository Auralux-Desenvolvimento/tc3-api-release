import { min } from "class-validator";
import { Request, Response } from "express";
import { getConnection } from "typeorm";
import * as yup from 'yup';
import AppError from "../../errors";
import Course from "../../models/course";
import ICourseData from "../../types/course/ICourseData";

interface IGetCourseQueryParams {
  name?: string;
  page: number;
}

const schema = yup.object().shape({
  courseName: yup.string()
    .max(254, "The course name must be up to 254 characters long")
    .min(2, "The course name must be at least 2 characters long"),
  page: yup.number()
    .integer("The page must be an integer")
    .min(1, "The page must be at least one")
    .required("The page is required")
});

export default async function getCourse (request: Request, response: Response) {
  const { page, name: courseName } = request.query as any as IGetCourseQueryParams;

  try {
    await schema.validate({ courseName, page });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const coursesQuery = getConnection().createQueryBuilder()
    .select("course.id", "id")
    .addSelect("course.name", "name")
    .from(Course, "course")
    .limit(20)
    .offset((page - 1) * 20)
  ;
  if (courseName) {
    coursesQuery.where("course.name like :name", { name: `%${courseName}%` });
  }
  const courses = await coursesQuery.getRawMany<ICourseData>();

  if (courses.length === 0) {
    throw new AppError([ 404, "No courses were found" ], 2);
  }

  return response.json(courses);
}