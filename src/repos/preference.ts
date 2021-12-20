import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Preference from "../models/preference";
import handleError from "./utils/handleError";

@EntityRepository(Preference)
export default class PreferenceRepo extends Repository<Preference> {
  public async Save (entities: Preference[]|Preference, options?: SaveOptions) {
    try {
      if (!Array.isArray(entities)) {
        entities = [ entities ];
      }
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: Preference|Preference[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}