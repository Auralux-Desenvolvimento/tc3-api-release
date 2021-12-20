import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup';
import AppError from "../../errors";
import CourseRepo from "../../repos/course";

const schema = yup.object().shape({
  id: yup.string()
    .uuid("The course id must be an UUID")
    .required("The course id is required"),
  name: yup.string()   
    .max(254, "The course name must be up to 254 characters long")
    .min(2, "The course name must be at least 2 characters long")
    .required("The course name is required")
});

export default async function patchCourse (request: Request, response: Response) {
  const id = request.params.id;
  let name = request.body.name as string;

  try {
    await schema.validate({ id, name });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  name = name.toLowerCase();
  const courseRepo = getCustomRepository(CourseRepo);    
  const result = await courseRepo.update({ id }, { name });
  
  if (!result.affected || result.affected === 0) {
    throw new AppError([ 404, "There's no course with such id" ], 2);
  }

  return response.status(200).send();
}