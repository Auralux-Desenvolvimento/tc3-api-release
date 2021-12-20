import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Favourite from "../models/favourite";
import handleError from "./utils/handleError";

@EntityRepository(Favourite)
export default class FavouriteRepo extends Repository<Favourite> {
  public async Save (entities: Favourite[]|Favourite, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      let savedEntities: Favourite|Favourite[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}