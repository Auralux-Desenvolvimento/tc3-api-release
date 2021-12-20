import { Brackets, Connection, SelectQueryBuilder } from "typeorm";
import Agreement from "../../models/agreement";
import Chat from "../../models/chat";

export default function isInAgreement (id: string, connection: Connection) {
  const isInAgreementQuery = connection.createQueryBuilder()
    .select("chat.id", "id")
    .from(Agreement, "agreement")
    .innerJoin(Chat, "chat", "chat.id = agreement.chat_id")
    .where("agreement.status = 'active'")
    .andWhere(new Brackets(qb => {
      qb.where("chat.team1_id = :team1", { team1: id })
        .orWhere("chat.team2_id = :team2", { team2: id })
    })) as SelectQueryBuilder<{ id: string } | undefined>
  ;
  return isInAgreementQuery;
}