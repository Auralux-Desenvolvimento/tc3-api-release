import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Course from "../models/course";
import detectProfanity from "../utils/functions/detectProfanity";
import handleError from "./utils/handleError";

@EntityRepository(Course)
export default class CourseRepo extends Repository<Course> {
  public async Save (entities: Course[]|Course, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        entity.name = entity.name.toLocaleLowerCase();
        await detectProfanity("course.name", entity.name);
      }
      let savedEntities: Course|Course[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}