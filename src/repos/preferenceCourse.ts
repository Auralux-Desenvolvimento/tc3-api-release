import { EntityRepository, Repository, SaveOptions } from "typeorm";
import PreferenceCourse from "../models/preferenceCourse";
import handleError from "./utils/handleError";

@EntityRepository(PreferenceCourse)
export default class PreferenceCourseRepo extends Repository<PreferenceCourse> {
  public async Save (entities: PreferenceCourse[]|PreferenceCourse, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      let savedEntities: PreferenceCourse|PreferenceCourse[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}