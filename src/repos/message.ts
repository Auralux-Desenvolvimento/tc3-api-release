import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Message from "../models/message";
import detectProfanity from "../utils/functions/detectProfanity";
import handleError from "./utils/handleError";

@EntityRepository(Message)
export default class MessageRepo extends Repository<Message> {
  public async Save (entities: Message[]|Message, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        await detectProfanity("message.content", entity.content);
      }
      let savedEntities: Message|Message[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}