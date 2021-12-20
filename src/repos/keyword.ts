import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Keyword from "../models/keyword";
import detectProfanity from "../utils/functions/detectProfanity";
import handleError from "./utils/handleError";

@EntityRepository(Keyword)
export default class KeywordRepo extends Repository<Keyword> {
  public async Save (entities: Keyword[]|Keyword, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        await detectProfanity("team.themeName", entity.name);
      }
      let savedEntities: Keyword|Keyword[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}