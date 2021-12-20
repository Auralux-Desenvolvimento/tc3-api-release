import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Agreement from "../models/agreement";
import handleError from "./utils/handleError";

@EntityRepository(Agreement)
export default class AgreementRepo extends Repository<Agreement> {
  public async Save (entities: Agreement[]|Agreement, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: Agreement|Agreement[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}