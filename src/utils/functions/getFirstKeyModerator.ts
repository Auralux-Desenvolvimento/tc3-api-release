import { getConnection } from "typeorm";
import Moderator from "../../models/moderator";
import ModKeys from "../../models/modKeys";

export default async function getFirstKeyModerator() {
  const connection = getConnection();

  const countMods = await connection.createQueryBuilder()
    .from(Moderator, "moderator")
    .select("count(moderator.id)", "count")
    .getCount();

  if(countMods === 0) {
    const modKey = await connection.createQueryBuilder()
    .from(ModKeys, "modKeys")
    .select("modKeys.id", "id")
    .getRawOne();

    return console.log("First Moderator Key: " + modKey.id);
  } else {
    return console.log("Moderator Already Exists");
  }
}