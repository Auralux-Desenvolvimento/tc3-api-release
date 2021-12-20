import { v4 as uuid } from "uuid";
import { getCustomRepository } from "typeorm";
import AppError from "../../errors";
import nodemailer from "nodemailer";
import EmailOperation, { OperationType } from "../../models/emailOperation";
import EmailOperationRepo from "../../repos/emailOperation";
import { readFileSync } from "fs";
import path from "path";
import { compile } from 'handlebars';
import UserRepo from "../../repos/user";
import User from "../../models/user";

export default async function sendConfirmationEmail (entity: string|User) {
  let user;

  const userRepo = getCustomRepository(UserRepo);
  
  if (typeof entity === "string") {    
    user = await userRepo.createQueryBuilder("user")
      .where("user.email = :email", { entity })
      .getOne();
  } else if (entity.id) {
    user = await userRepo.findOne({
      where: { id: entity.id }
    });
  }
  
  if(!user) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  const emailOperationRepo = getCustomRepository(EmailOperationRepo);

  const token = await emailOperationRepo.findOne({
    where: {
      user,
      operationType: 'email',
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

async function sendMail (user: User, emailOperationRepo: EmailOperationRepo) {
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
    file = readFileSync(path.join(__dirname, "..", "..", "views", "emailConfirmation.hbs"), "utf8");
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
    subject: "Link para confirmar seu email",
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
  emailOperation.operationType = OperationType.email;
  emailOperation.user = user;
  
  await emailOperationRepo.Save(emailOperation);
}