import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup';
import AppError from "../../errors";
import CourseRepo from "../../repos/course";
import { compareTwoStrings } from 'string-similarity';

let schema = yup.string()
  .required("Name is required")
  .max(254, "Name must have up to 254 characters");

interface ISimilarCourses {
  id: string;
  name: string;
  similarity: number;
}

export default async function getCourseSearch (request: Request, response: Response) {
  let name: string = request.params.name;

  try {
    schema.validate(name);
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  name = name.toLowerCase();

  const courseRepo = getCustomRepository(CourseRepo);
  const courses = await courseRepo.find();
  
  //adds a new attribute thar represents the similarity of all Courses with the provided string
  let newCourses = courses.map<ISimilarCourses>(({ id, name: courseName }) => ({
    id,
    name: courseName,
    similarity: compareTwoStrings(name, courseName)
  }));
  
  newCourses = newCourses
    .filter(e => e.similarity !== 0)
    .sort((a, b) => b.similarity - a.similarity)
    .splice(0, 5);

  return response.json(newCourses);
}