import { Request, Response } from "express";
import { getConnection, getCustomRepository } from "typeorm";
import * as yup from 'yup'
import AppError from "../../errors";
import Moderator from "../../models/moderator";
import User from "../../models/user";
import ModeratorRepo from "../../repos/moderator";
import ModKeysRepo from "../../repos/modKeys";
import hash from "../../utils/functions/password/hash";
import passwordSchema from "../../utils/schemas/passwordSchema";

const schema = yup.object().shape({
  name: yup.string()
    .min(2, "A moderator name must have a length of up to 2 characters")
    .max(45, "A moderator name must have a length of up to 45 characters"),
  email: yup.string()
    .email("A moderator email must be an email")
    .required("A moderator email is required"),
  password: passwordSchema
    .required("A moderator password is required"),
  key: yup.string()
    .uuid("A moderator key must be an uuid")
    .required("A moderator key is required"),
});

export default async function registerModerator(request: Request, response: Response) {
  const { name, email, password, key } = request.body;

  try {
    await schema.validate({ name, email, password, key });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const modKeysRepo = getCustomRepository(ModKeysRepo);
  const modKey = await modKeysRepo.findOne({ 
    where: { 
      id: key 
    }
  })

  if(!modKey) {
    throw new AppError([ 404, "The key does not exists"], 2);
  }

  const moderatorRepo = getCustomRepository(ModeratorRepo);
  const keyAlreadyInUse = await moderatorRepo.findOne({
    where: {
      modKey
    }
  });

  if(keyAlreadyInUse) {
    throw new AppError([ 400, "Key in use"], 3);
  }

  await getConnection().transaction(async manager => {
    let moderator = new Moderator();
    let user = new User();
  
    user.name = name;
    user.email = email;
    try {
      user.password = await hash(password);
    } catch (hashError) {
      throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
    }

    try {
      await user.validate();
      user = await manager.save(user);
      if (!user) {
        throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
      }
    } catch (error: any) {
      throw new AppError([ 500, error.errors ], 0);
    }

    moderator.user = user;
    moderator.modKey = modKey;
    try {
      await moderator.validate();
      moderator = await manager.save(moderator);
      if (!moderator) {
        throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
      }
    } catch (error: any) {
      throw new AppError([ 500, error.errors ], 0);
    }
  });
  return response.status(201).json("The moderator was successfully created");
}