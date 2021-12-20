import { Request, Response } from "express";
import { getConnection, getCustomRepository } from "typeorm";
import AppError from "../../errors";
import * as yup from 'yup'
import Moderator from "../../models/moderator";
import ModKeys from "../../models/modKeys";
import User from "../../models/user";

interface IGetKeysResponse {
  key: string;
  issuer?: {
    name: string;
    email: string;
  },
  receiver?: {
    name: string;
    email: string;
  }
};

const schema = yup.object().shape({
  page: yup.number()
    .min(1, "The page index must be at least 1")
    .integer("The page index must be an integer")
    .required("The page index is required")
});

export default async function getKeys(request: Request, response: Response) {
  const page = Number(request.query.page);
  const connection = getConnection();

  try {
    await schema.validate({ page });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  let keys = await connection.createQueryBuilder()
    .select("modKeys.id", "key")
    .addSelect("userIssuer.name", "issuerName")
    .addSelect("userIssuer.email", "issuerEmail")
    .addSelect("userReceiver.name", "receiverName")
    .addSelect("userReceiver.email", "receiverEmail")
    .from(ModKeys, "modKeys")
    .leftJoin(Moderator, "moderatorIssuer", "modKeys.issuer_id = moderatorIssuer.id")
    .leftJoin(User, "userIssuer", "userIssuer.id = moderatorIssuer.user_id")
    .leftJoin(Moderator, "moderatorReceiver", "modKeys.id = moderatorReceiver.mod_key_id")
    .leftJoin(User, "userReceiver", "userReceiver.id = moderatorReceiver.user_id")
    .orderBy("modKeys.created_at")
    .limit(20)
    .offset(20 * (page - 1))
    .getRawMany();

  if(keys.length <= 0) {
    throw new AppError([404, "No keys were found."], 1);
  }

  keys = keys.map<IGetKeysResponse>(e => {
    const returnValue: IGetKeysResponse = {
      key: e.key
    };

    if (e.issuerName && e.issuerEmail) {
      returnValue.issuer = {
        name: e.issuerName,
        email: e.issuerEmail,
      };
    }

    if (e.receiverName && e.receiverEmail) {
      returnValue.receiver = {
        name: e.receiverName,
        email: e.receiverEmail,
      };
    }

    return returnValue;
  });

  response.status(200).json(keys);
}