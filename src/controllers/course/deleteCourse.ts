import { Request, Response } from "express";
import { DeleteResult, getCustomRepository, QueryFailedError } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import Course from "../../models/course";
import CourseRepo from "../../repos/course";

const schema = yup.string()
  .uuid("The course id must be an UUID")
  .required("The course id is required")
;

export default async function deleteCourse (request: Request, response: Response) {
  const id = request.params.id;

  try {
    await schema.validate(id);
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const courseRepo = getCustomRepository(CourseRepo);
  let result: DeleteResult;
  try {
    result = await courseRepo.delete({ id });
  } catch (error: any) {
    switch (error.code) {
      case "23503":
      // case 1451:
        throw new AppError([ 400, "You cannot delete this course because there are people already using it, try merging it instead" ], 2);
      default:
        throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
    }
  }
  
  if (!result.affected || result.affected === 0) {
    throw new AppError([ 404, "There's no course with such id" ], 2);
  }

  return response.status(200).send();
}