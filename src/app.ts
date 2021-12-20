import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import cookieParser from 'cookie-parser';
import AppError, { IAppErrorLiteral } from "./errors";
import cors from "cors";
import router from "./routes";
import path from "path";

const app = express();

app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_ORIGIN?.split(",")
}));
app.use(express.json());
app.use(router);
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV !== "allow-errors" && process.env.NODE_ENV !== "allow-all-errors") {
  app.use((err: Error|AppError|any, _req: Request, res: Response, _next: NextFunction) => {
    if (err.name === "AppError") {
      return res.status(err.code).json({
        code: err.operationCode,
        message: err.message,
        details: err.details
      } as IAppErrorLiteral)}

    const message = process.env.NODE_ENV === "dev" 
      ? `Internal server error: ${err.message}.`
      : "Internal server error.";
     
    return res.status(500).json({
      code: 0,
      message
    });
  });
}

export default app;