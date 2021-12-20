import { NextFunction, Request, Response } from "express";
import { Brackets, Connection, SelectQueryBuilder } from "typeorm";
import { InnerAuth } from "../../middlewares/auth/functions/auth";
import Agreement from "../../models/agreement";
import Chat from "../../models/chat";
import City from "../../models/city";
import Course from "../../models/course";
import Interest from "../../models/interest";
import Preference from "../../models/preference";
import PreferenceCourse from "../../models/preferenceCourse";
import PreferenceKeyword from "../../models/preferenceKeyword";
import State from "../../models/state";
import Team from "../../models/team";
import TeamKeyword from "../../models/teamKeyword";
import User from "../../models/user";

export async function simpleSearchAuth (
  request: Request, 
  response: Response, 
  next: NextFunction
) {
  await InnerAuth(request, response, next, ((qb: SelectQueryBuilder<Team>) => {
    return qb
      .innerJoinAndSelect("team.course", "course")
      .innerJoinAndSelect("team.teamKeywords", "teamKeywords")
      .innerJoinAndSelect("team.city", "city")
      .innerJoinAndSelect("city.state", "state")
      .innerJoinAndSelect("team.preferences", "preferences")
      .innerJoinAndSelect("preferences.preferenceCourses", "preferenceCourses")
      .leftJoinAndSelect("preferences.preferenceKeywords", "preferenceKeywords")
      .leftJoinAndSelect("preferences.city", "preferenceCity")
      .leftJoinAndSelect("preferences.state", "preferenceState")
      .take(1)
      .orderBy("preferences.createdAt", "DESC")
  }) as any);
}

export default function simpleSearch (team: Team, connection: Connection) {
  const lastPreference = team.preferences[0];

  //teams that have already been shown interest or disinterest by the searcher
  const invalidTeamsQuery = connection.createQueryBuilder()
    .select("interest.subject_id")
    .from(Interest, "interest")
    .where("interest.agent_id = :teamId", { teamId: team.id });

  //teams that are in agreements (1)
  const unavailableTeams1 = connection.createQueryBuilder()
    .select("chat.team1_id", "team1")
    .from(Agreement, "agreement")
    .innerJoin(Chat, "chat", "chat.id = agreement.chat_id")
    .where("agreement.status = 'active'")
  ;

  //teams that are in agreements (2)
  const unavailableTeams2 = connection.createQueryBuilder()
    .select("chat.team2_id", "team2")
    .from(Agreement, "agreement")
    .innerJoin(Chat, "chat", "chat.id = agreement.chat_id")
    .where("agreement.status = 'active'")
  ;

  const preferenceCourseQuery = connection.createQueryBuilder()
    .select("preference_course.course_id")
    .from(PreferenceCourse, "preference_course")
    .where("preference.id = preference_course.preference_id")
  ;

  const preferenceKeywordsQuery = connection.createQueryBuilder()
    .select("preference_keyword.keyword_id")
    .from(PreferenceKeyword, "preference_keyword")
    .where("preference.id = preference_keyword.preference_id")
  ;

  const courses: string[] = lastPreference.preferenceCourses.map(e => e.course as any);
  const teamKeywords: string[] = team.teamKeywords.map(e => e.keyword as any);

  const teamsQuery = connection.createQueryBuilder()
    .from(Team, "team")
    .innerJoin(Course, "course", "course.id = team.course_id")
    .innerJoin(City, "city", "city.id = team.city_id")
    .innerJoin(State, "state", "state.id = city.state_id")
    .innerJoin(Preference, "preference", "team.id = preference.team_id")
    .innerJoin(User, "user", "user.id = team.user_id")
    .where("team.id <> :id", { id: team.id })
    //checking if the team is within the area of desire of other teams
    .andWhere(new Brackets(qb => {
      qb.where("preference.city_id = :teamCity", { teamCity: team.city.id })
        .orWhere("preference.state_id = :teamState", { teamState: team.city.state.id })
        .orWhere(new Brackets(qb2 => {
          qb2.where("preference.city_id is null")
            .andWhere("preference.state_id is null")
        }))
    }))
    //checking if the team has the preferred theme option of other teams
    .andWhere(new Brackets(qb => {
      qb.where("preference.theme_preference = :teamTheme", { teamTheme: !!team.themeName })
        .orWhere("preference.theme_preference is null")
    }))
    //checking if the team's keyword preferences apply to the user's team
    .andWhere(new Brackets(qb => {
      qb.where("not exists (" + preferenceKeywordsQuery.getQuery() + ")")
        .orWhere("exists ((select unnest(array[:...teamKeywords])) intersect (" + preferenceKeywordsQuery.getQuery() + "))", { teamKeywords })
    }))
    //checking if this team is in the course which the user's team is interested in
    .andWhere("course.id in (:...courses)", { courses })
    //checking if the team is interested in teams with this course
    .andWhere(":teamCourse in (" + preferenceCourseQuery.getQuery() + ")", { teamCourse: team.course.id })
    //checks if the team already has been shown interest by the searcher
    .andWhere("team.id not in (" + invalidTeamsQuery.getQuery() + ")")
    //checks if the team is available
    .andWhere("team.id not in (" + unavailableTeams1.getQuery() + ")")
    //checks if the team is available
    .andWhere("team.id not in (" + unavailableTeams2.getQuery() + ")")
    //checks if the team is active
    .andWhere("team.is_active = true")
    .setParameters(invalidTeamsQuery.getParameters())
    .groupBy("team.id")
  ;

  if (lastPreference.city) {
    teamsQuery.andWhere("city.id = :cityId", { cityId: lastPreference.city.id });
  } else if (lastPreference.state) {
    teamsQuery.andWhere("state.id = :stateId", { stateId: lastPreference.state.id });
  }
  
  if (typeof lastPreference.themePreference === "boolean") {
    teamsQuery.andWhere(`team.theme_name is ${!!lastPreference.themePreference ? "not" : ""} null`);
  }

  //if there are keyword specified in the preference, sets the query to match them
  const preferenceKeywords: string[] = lastPreference.preferenceKeywords.map(e => e.keyword as any);
  if (preferenceKeywords.length > 0) {
    const teamKeywordsQuery = connection.createQueryBuilder()
      .select("team_keyword.keyword_id")
      .from(TeamKeyword, "team_keyword")
      .where("team.id = team_keyword.team_id")
    ;
    
    teamsQuery
      //first, we check if the teams have intersecting keywords to the user's preference
      .andWhere("exists ((select unnest(array[:...preferenceKeywords])) intersect (" + teamKeywordsQuery.getQuery() + "))", { preferenceKeywords })
    ;
  }

  return teamsQuery;
} 