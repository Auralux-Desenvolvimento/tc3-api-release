import { Request } from "express";

export default function parseCookies (request: Request): { [key: string]: string } {
  const { cookie } = request.headers;
  const parsedCookies: { [key: string]: string } = {};
  if (cookie) {
    const cookies = cookie.split("; ");
    cookies.forEach((e) => {
      const preCookie = e.split("=");
      parsedCookies[preCookie[0]] = preCookie[1];
    });
  }
  return parsedCookies;
}