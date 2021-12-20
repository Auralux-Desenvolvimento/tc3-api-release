import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup';
import AppError from "../../errors";
import { compareTwoStrings } from 'string-similarity';
import KeywordRepo from "../../repos/keyword";

let schema = yup.string()
  .required("Name is required")
  .max(254, "Name must have up to 254 characters");

interface ISimilarKeywords {
  id: string;
  name: string;
  similarity: number;
}

export default async function getKeywordSearch (request: Request, response: Response) {
  let name: string = request.params.name;

  try {
    schema.validate(name);
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  name = name.toLowerCase();

  const keywordRepo = getCustomRepository(KeywordRepo);
  const keywords = await keywordRepo.find();
  
  //adds a new attribute thar represents the similarity of all Courses with the provided string
  let newKeywords = keywords.map<ISimilarKeywords>(({ id, name: keywordName }) => ({
    id,
    name: keywordName,
    similarity: compareTwoStrings(name, keywordName)
  }));
  
  newKeywords = newKeywords
    .filter(e => e.similarity !== 0)
    .sort((a, b) => b.similarity - a.similarity)
    .splice(0, 5);

  return response.json(newKeywords);
}