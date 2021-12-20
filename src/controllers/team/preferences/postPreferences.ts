import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from "yup";
import AppError from "../../../errors";
import Preference from "../../../models/preference";
import PreferenceCourse from "../../../models/preferenceCourse";
import PreferenceKeyword from "../../../models/preferenceKeyword";
import CityRepo from "../../../repos/city";
import CourseRepo from "../../../repos/course";
import KeywordRepo from "../../../repos/keyword";
import PreferenceRepo from "../../../repos/preference";
import PreferenceCourseRepo from "../../../repos/preferenceCourse";
import PreferenceKeywordRepo from "../../../repos/preferenceKeyword";
import StateRepo from "../../../repos/state";
import IAuthRequestBody from "../../../types/IAuthRequestBody";

interface IPostReferenceData extends IAuthRequestBody {
  city?: string;
  state?: string;
  hasTheme?: boolean;
  courses: string[];
  keywords?: string[];
}

const schema = yup.object().shape({
  city: yup.string()
    .uuid("City must be an uuid")
    .test(
      "mutuallyExclusiveFields", 
      "City and State are mutually exclusive", 
      function (city): boolean {
        const { state } = this.parent;
        return !(city && state);
      }
    ),
  state: yup.string()
    .uuid("State must be an uuid")
    .test(
      "mutuallyExclusiveFields", 
      "City and State are mutually exclusive", 
      function (state): boolean {
        const { city } = this.parent;
        return !(state && city);
      }
    ),
  hasTheme: yup.boolean(),
  courses: yup.array(
    yup.string()
      .uuid("Course must be an uuid")
      .required("Course is required")
  )
    .min(1, "There must be at least one course")
    .required("There must be at least one course"),
  keywords: yup.array(
    yup.string()
      .uuid("Keyword must be an uuid")
      .required("Keyword is required")
  )
});

export default async function postPreference (request: Request, response: Response) {
  const { courses, city, hasTheme, state, user, keywords } = request.body as IPostReferenceData;

  try {
    await schema.validate({ courses, city, hasTheme, state, keywords });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  let preference: Preference|undefined = new Preference();
  preference.team = user;
  if (typeof hasTheme !== "undefined") {
    preference.themePreference = hasTheme;
  }

  if (city) {
    const cityRepo = getCustomRepository(CityRepo);
    const cityEntity = await cityRepo.findOne({ id: city });
    if (!cityEntity) {
      throw new AppError([ 400, "No city with such id" ], 2);
    }
    preference.city = cityEntity;
  } else if (state) {
    const stateRepo = getCustomRepository(StateRepo);
    const stateEntity = await stateRepo.findOne({ id: state });
    if (!stateEntity) {
      throw new AppError([ 400, "No state with such id" ], 3);
    }
    preference.state = stateEntity;
  }
  
  const preferenceRepo = getCustomRepository(PreferenceRepo);
  preference = await preferenceRepo.Save(preference) as Preference;

  if (!preference) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  if (keywords && hasTheme) {
    const keywordRepo = getCustomRepository(KeywordRepo);
    const preferenceKeywordRepo = getCustomRepository(PreferenceKeywordRepo);
    for (let keywordId of keywords) {
      const keyword = await keywordRepo.findOne({ id: keywordId });
      if (!keyword) {
        throw new AppError([ 400, "Invalid keyword" ], 5);
      }
  
      let preferenceKeyword = new PreferenceKeyword();
      preferenceKeyword.preference = preference;
      preferenceKeyword.keyword = keyword;
      await preferenceKeywordRepo.Save(preferenceKeyword);
    }
  }

  const courseRepo = getCustomRepository(CourseRepo);
  const preferenceCourseRepo = getCustomRepository(PreferenceCourseRepo);
  for (let courseId of courses) {
    const course = await courseRepo.findOne({ id: courseId });
    if (!course) {
      throw new AppError([ 400, "Invalid course" ], 4);
    }

    let preferenceCourse = new PreferenceCourse();
    preferenceCourse.course = course;
    preferenceCourse.preference = preference;
    await preferenceCourseRepo.Save(preferenceCourse);
  }

  response.status(201).send();
}