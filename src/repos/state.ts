import { EntityRepository, Repository, SaveOptions } from "typeorm";
import State from "../models/state";
import handleError from "./utils/handleError";

@EntityRepository(State)
export default class StateRepo extends Repository<State> {
  public async Save (entities: State[]|State, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: State|State[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}