import { EntityRepository, Repository, SaveOptions } from "typeorm";
import User from "../models/user";
import handleError from "./utils/handleError";
import detectProfanity from "../utils/functions/detectProfanity";

@EntityRepository(User)
export default class UserRepo extends Repository<User> {
  public async Save (entities: User[]|User, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        await detectProfanity("team.name", entity.name);
      }
      let savedEntities: User|User[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}