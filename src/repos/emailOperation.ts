import { EntityRepository, Repository, SaveOptions } from "typeorm";
import EmailOperation from "../models/emailOperation";
import handleError from "./utils/handleError";

@EntityRepository(EmailOperation)
export default class EmailOperationRepo extends Repository<EmailOperation> {
  public async Save (entities: EmailOperation[]|EmailOperation, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: EmailOperation|EmailOperation[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}