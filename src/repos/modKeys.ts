import { EntityRepository, Repository, SaveOptions } from "typeorm";
import ModKeys from "../models/modKeys";
import handleError from "./utils/handleError";

@EntityRepository(ModKeys)
export default class ModKeysRepo extends Repository<ModKeys> {
  public async Save (entities: ModKeys[]|ModKeys, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      let savedEntities: ModKeys|ModKeys[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}