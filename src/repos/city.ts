import { EntityRepository, Repository, SaveOptions } from "typeorm";
import City from "../models/city";
import handleError from "./utils/handleError";

@EntityRepository(City)
export default class CityRepo extends Repository<City> {
  public async Save (entities: City[]|City, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: City|City[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}