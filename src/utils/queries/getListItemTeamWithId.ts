import { Connection } from "typeorm";
import City from "../../models/city";
import Country from "../../models/country";
import Course from "../../models/course";
import State from "../../models/state";
import Team from "../../models/team";
import User from "../../models/user";

export default function getListItemTeamWithId (connection: Connection) {
  const listItemTeamWithIdQuery = connection.createQueryBuilder()
    .select("team.id", "id")
    .addSelect("user.name", "name")
    .addSelect("team.logo_url", "logoURL")
    .addSelect("course.name", "course")
    .addSelect("team.theme_name", "theme")
    .addSelect("concat(city.name, ', ', state.name,  ' - ' , country.name)", "city")
    .from(Team, "team")
    .innerJoin(User, "user", "user.id = team.user_id")
    .innerJoin(City, "city", "city.id = team.city_id")
    .innerJoin(State, "state", "state.id = city.state_id")
    .innerJoin(Country, "country", "country.id = state.country_id")
    .innerJoin(Course, "course", "course.id = team.course_id")
  ;

  return listItemTeamWithIdQuery;
}