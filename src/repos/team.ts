import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Team from "../models/team";
import detectProfanity from "../utils/functions/detectProfanity";
import parseDraft from "../utils/functions/parseDraft";
import handleError from "./utils/handleError";

@EntityRepository(Team)
export default class TeamRepo extends Repository<Team> {
  public async Save (entities: Team[]|Team, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        await detectProfanity("team.themeName", entity.themeName);
        await detectProfanity("team.themeDescription", entity.themeDescription);
        entity.portfolio && await detectProfanity("team.portfolio", parseDraft(entity.portfolio, "Invalid portfolio"));
      }
      let savedEntities: Team|Team[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}