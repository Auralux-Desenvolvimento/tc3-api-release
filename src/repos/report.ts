import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Report from "../models/report";
import handleError from "./utils/handleError";

@EntityRepository(Report)
export default class ReportRepo extends Repository<Report> {
  public async Save (entities: Report[]|Report, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
      }
      let savedEntities: Report|Report[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}