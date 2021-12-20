import { v4 as uuid } from "uuid";
import { getCustomRepository } from "typeorm";
import AppError from "../../errors";
import nodemailer from "nodemailer";
import EmailOperation, { OperationType } from "../../models/emailOperation";
import EmailOperationRepo from "../../repos/emailOperation";
import { compile } from "handlebars";
import { readFileSync } from "fs";
import path from "path";
import UserRepo from "../../repos/user";
import User from "../../models/user";

export default async function sendRecoveryPassEmail (email: string) {
  const userRepo = getCustomRepository(UserRepo);

  let user = await userRepo.createQueryBuilder("user")
    .where("user.email = :email", { email })
    .getOne();

  if(!user) {
    throw new AppError([ 400, "There is no such user with the provided email" ], 1);
  }

  const emailOperationRepo = getCustomRepository(EmailOperationRepo);

  const token = await emailOperationRepo.findOne({
    where: {
      user,
      operationType: 'password',
      isValid: true
    }
  });

  if(token) {
    if(token.expiryDate.getTime() < Date.now()) {
      token.isValid = false;
      await emailOperationRepo.Save(token);
      await sendMail(user, emailOperationRepo);
      return;
    } else {
      throw new AppError([400, "A token already exists."], 2)
    }
  }
  await sendMail(user, emailOperationRepo);
}

async function sendMail(user: User, emailOperationRepo: EmailOperationRepo) {
  const newToken = uuid();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NOREPLY_EMAIL,
      pass: process.env.NOREPLY_PASS
    }
  });

  let file;
  try {
    file = readFileSync(path.join(__dirname, "..", "..", "views", "passwordRecovery.hbs"), "utf8");
  } catch (error) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  const template = compile(file);
  const HTMLOptions = {
    frontendOrigin: process.env.FRONTEND_ORIGIN,
    token: newToken,
    backendOrigin: `${process.env.BACKEND_ORIGIN}:${process.env.PORT}`
  }
  
  const mailOptions = {
    from: process.env.NOREPLY_EMAIL,
    to: user.email,
    subject: "Link para recuperar sua senha",
    html: template(HTMLOptions)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.log(error);
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  const emailOperation = new EmailOperation();

  emailOperation.id = newToken;
  emailOperation.expiryDate = new Date(Date.now() + 1800000);
  emailOperation.isValid = true;
  emailOperation.operationType = OperationType.password;
  emailOperation.user = user;

  await emailOperationRepo.Save(emailOperation);
}