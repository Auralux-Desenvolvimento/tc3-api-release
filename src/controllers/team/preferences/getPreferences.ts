import { NextFunction, Request, Response } from "express";
import { SelectQueryBuilder } from "typeorm";
import AppError from "../../../errors";
import IAuthRequestBody from "../../../types/IAuthRequestBody";
import { InnerAuth } from "../../../middlewares/auth/functions/auth";
import Team from "../../../models/team";

interface IGetPreferenceResponse {
  area?: string;
  themePreference?: boolean;
  courses: string[];
  keywords?: string[];
}

export async function getPreferenceAuth (request: Request, response: Response, next: NextFunction) {
  await InnerAuth(request, response, next, ((qb: SelectQueryBuilder<Team>) => {
    return qb
      .innerJoinAndSelect("team.preferences", "preferences")
      .innerJoinAndSelect("preferences.preferenceCourses", "preferenceCourses")
      .innerJoinAndSelect("preferenceCourses.course", "courses")
      .leftJoinAndSelect("preferences.preferenceKeywords", "preferenceKeywords")
      .leftJoinAndSelect("preferenceKeywords.keyword", "keywords")
      .leftJoinAndSelect("preferences.city", "preferenceCity")
      .leftJoinAndSelect("preferences.state", "preferenceState")
      .leftJoinAndSelect("preferenceCity.state", "cityState")
      .leftJoinAndSelect("cityState.country", "cityCountry")
      .leftJoinAndSelect("preferenceState.country", "stateCountry")
      .orderBy("preferences.createdAt", "DESC")
      .take(1);
  }) as any
  );
}

export default async function getPreference (request: Request, response: Response) {
  const { user: team } = request.body as IAuthRequestBody;
  const preference = team.preferences[0];

  if (!preference) {
    throw new AppError([ 400, "No preferences set" ], 1);
  }
  
  const responseBody: IGetPreferenceResponse = {
    courses: preference.preferenceCourses.map(e => e.course.name)
  };

  if (preference.preferenceKeywords) {
    responseBody.keywords = preference.preferenceKeywords.map(e => e.keyword.name);
  }
  
  if (preference.city) {
    responseBody.area = `${preference.city.name}, ${preference.city.state.name} - ${preference.city.state.country.name}`;
  } else if (preference.state) {
    responseBody.area = `${preference.state.name} - ${preference.state.country.name}`;
  }

  if (preference.themePreference != null) {
    responseBody.themePreference = preference.themePreference;
  }

  response.json(responseBody);
}