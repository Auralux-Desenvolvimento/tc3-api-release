import { EntityRepository, Repository, SaveOptions } from "typeorm";
import TeamKeyword from "../models/teamKeyword";
import handleError from "./utils/handleError";

@EntityRepository(TeamKeyword)
export default class TeamKeywordRepo extends Repository<TeamKeyword> {
  public async Save (entities: TeamKeyword[]|TeamKeyword, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      let savedEntities: TeamKeyword|TeamKeyword[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}