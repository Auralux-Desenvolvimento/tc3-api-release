import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Advisor from "../models/advisor";
import detectProfanity from "../utils/functions/detectProfanity";
import handleError from "./utils/handleError";

@EntityRepository(Advisor)
export default class AdvisorRepo extends Repository<Advisor> {
  public async Save (entities: Advisor[]|Advisor, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        await detectProfanity("advisor.name", entity.name);
      }
      let savedEntities: Advisor|Advisor[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}