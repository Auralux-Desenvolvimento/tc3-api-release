import { Connection } from "typeorm";
import Moderator from "../../models/moderator";
import User from "../../models/user";

export default function getModeratorData (connection: Connection) {
  const moderatorQuery = connection.createQueryBuilder()
    .select("moderator.id", "id")
    .addSelect("user.name", "name")
    .addSelect("user.email", "email")
    .addSelect("user.is_verified", "isVerified")
    .from(Moderator, "moderator")
    .innerJoin(User, "user", "user.id = moderator.user_id")
  ;

  return moderatorQuery;
}