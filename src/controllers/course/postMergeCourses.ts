import { Request, Response } from "express";
import { getConnection } from "typeorm";
import * as yup from 'yup';
import AppError from "../../errors";
import Course from "../../models/course";
import PreferenceCourse from "../../models/preferenceCourse";
import Team from "../../models/team";

interface IPostMergeCoursesRequest {
  primary: string;
  secondaries: string[];
}

const schema = yup.object().shape({
  primary: yup.string()
    .uuid("The primary course id must be an UUID")
    .required("The primary course id is required"),
  secondaries: yup.array()
    .of(
      yup.string()
        .uuid("The secondary course id must be an UUID")
        .required("The secondary course id is required")
    )
    .min(1, "At least one secondary course is required")
    .required("The array of secondaries is required")
});

export default async function postMergeCourses (request: Request, response: Response) {
  const { primary, secondaries } = request.body as IPostMergeCoursesRequest;

  try {
    await schema.validate({ primary, secondaries });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  const connection = getConnection();

  //removes possible duplicates from "preference_course" first
  const removeDuplicatesSubquery = connection.createQueryBuilder()
    .select("inner_query.preference_id")
    .from(qb => {
      return qb.select("preference_course2.preference_id", "preference_id")
        .from(PreferenceCourse, "preference_course2")
        .where("preference_course2.course_id = :primary", { primary })
    }, "inner_query")
  ;

  const removeDuplicatesQuery = connection.createQueryBuilder()
    .delete()
    .from(PreferenceCourse, "preference_course")
    .where("preference_course.course_id in (:...secondaries)", { secondaries })
    .andWhere("preference_course.preference_id in ("+ removeDuplicatesSubquery.getQuery() +")")
    .setParameters(removeDuplicatesSubquery.getParameters())
  ;
  try {
    await removeDuplicatesQuery.execute();
  } catch (error) {
    throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
  }

  //updates the remaining "preference_course" rows
  const updatePreferenceCoursesQuery = connection.createQueryBuilder()
    .update(PreferenceCourse)
    .set({ course: { id: primary } })
    .where("preference_course.course_id in (:...secondaries)", { secondaries })
  ;
  try {
    await updatePreferenceCoursesQuery.execute();
  } catch (error) {
    throw new AppError([ 400, "Invalid ids" ], 2);
  }

  //updates the "team" rows
  const updateTeamQuery = connection.createQueryBuilder()
    .update(Team)
    .set({ course: { id: primary } })
    .where("team.course_id in (:...secondaries)", { secondaries })
  ;
  try {
    await updateTeamQuery.execute();
  } catch (error) {
    throw new AppError([ 400, "Invalid ids" ], 2);
  }

  //finally, deletes all courses in "secondaries"
  const deleteCourseQuery = connection.createQueryBuilder()
    .delete()
    .from(Course, "course")
    .where("course.id in (:...secondaries)", { secondaries })
  ;
  try {
    await deleteCourseQuery.execute();
  } catch (error) {
    throw new AppError([ 400, "Invalid ids" ], 2);
  }

  return response.status(200).send();
}