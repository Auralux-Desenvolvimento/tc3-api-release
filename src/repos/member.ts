import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Member from "../models/member";
import detectProfanity from "../utils/functions/detectProfanity";
import handleError from "./utils/handleError";

@EntityRepository(Member)
export default class MemberRepo extends Repository<Member> {
  public async Save (entities: Member[]|Member, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        await detectProfanity("member.name", entity.name);
        await detectProfanity("member.role", entity.role);
        entity.description && await detectProfanity("member.description", entity.description);
      }
      let savedEntities: Member|Member[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}