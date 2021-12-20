import { EntityRepository, Repository, SaveOptions } from "typeorm";
import PreferenceKeyword from "../models/preferenceKeyword";
import handleError from "./utils/handleError";

@EntityRepository(PreferenceKeyword)
export default class PreferenceKeywordRepo extends Repository<PreferenceKeyword> {
  public async Save (entities: PreferenceKeyword[]|PreferenceKeyword, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      let savedEntities: PreferenceKeyword|PreferenceKeyword[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}