import { EntityRepository, getCustomRepository, Repository, SaveOptions } from "typeorm";
import Profanity from "../models/profanity";
import handleError from "./utils/handleError";

@EntityRepository(Profanity)
export default class ProfanityRepo extends Repository<Profanity> {
  public async Save (entities: Profanity[]|Profanity, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: Profanity|Profanity[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}