import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Chat from "../models/chat";
import handleError from "./utils/handleError";

@EntityRepository(Chat)
export default class ChatRepo extends Repository<Chat> {
  public async Save (entities: Chat[]|Chat, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: Chat|Chat[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}