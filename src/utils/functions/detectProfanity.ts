import { getCustomRepository } from "typeorm";
import AppError from "../../errors";
import ProfanityRepo from "../../repos/profanity";

export default async function detectProfanity (location: string, value?: string|string[]|null) {
  if (value) {
    if (Array.isArray(value)) {
      value = value.join(" ");
    }
    const values = value.split(/[ _-]/);
    const profanityRepo = getCustomRepository(ProfanityRepo);
    for (let word of values) {
      word = word.toLocaleLowerCase();
      let isProfanity;
      try {
        isProfanity = await profanityRepo.findOne({ name: word });
      } catch {
        throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
      }
      if (!!isProfanity) {
        throw new AppError([ 400, "Profanity detected" ], -2, {
          value: word,
          location
        })
      }
    }
  }
}