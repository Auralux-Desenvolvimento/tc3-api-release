import { EntityRepository, Repository, SaveOptions } from "typeorm";
import Post from "../models/post";
import detectProfanity from "../utils/functions/detectProfanity";
import parseDraft from "../utils/functions/parseDraft";
import handleError from "./utils/handleError";

@EntityRepository(Post)
export default class PostRepo extends Repository<Post> {
  public async Save (entities: Post[]|Post, options?: SaveOptions) {
    if (!Array.isArray(entities)) {
      entities = [ entities ];
    }
    try {
      for (const entity of entities) {        
        await entity.validate();
        await detectProfanity("post.title", entity.title);
        await detectProfanity("post.content", parseDraft(entity.content, "Invalid post"));
      }
      let savedEntities: Post|Post[] = await super.save(entities, options);
      if (savedEntities.length === 1) {
        savedEntities = savedEntities[0];
      }
      return savedEntities;
    } catch (error) {
      handleError(error);
    }
  }
}