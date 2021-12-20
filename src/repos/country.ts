import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Country from "../models/country";
import handleError from "./utils/handleError";

@EntityRepository(Country)
export default class CountryRepo extends Repository<Country> {
  public async Save (entities: Country[]|Country, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: Country|Country[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}