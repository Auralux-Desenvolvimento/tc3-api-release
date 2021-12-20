import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Interest from "../models/interest";
import handleError from "./utils/handleError";

@EntityRepository(Interest)
export default class InterestRepo extends Repository<Interest> {
  public async Save (entities: Interest[]|Interest, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      let savedEntities: Interest|Interest[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}