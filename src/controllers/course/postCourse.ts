import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import Course from "../../models/course";
import CourseRepo from "../../repos/course";

interface IPostCorseRequest {
  name: string;
}

const schema = yup.string()
  .max(254, "The course name must be up to 254 characters long")
  .min(2, "The course name must be at least 2 characters long")
  .required("The course name is required")
;

export default async function postCourse (request: Request, response: Response) {
  const courseName = (request.body as IPostCorseRequest).name;

  try {
    await schema.validate(courseName);
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const courseRepo = getCustomRepository(CourseRepo);
  let course: Course | undefined = new Course();
  course.name = courseName;
  course = await courseRepo.Save(course) as Course | undefined;

  if (!course) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  return response.status(201).json({
    id: course.id,
    name: course.name
  });
}