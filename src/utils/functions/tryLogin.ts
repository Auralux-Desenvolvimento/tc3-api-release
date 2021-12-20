import bcrypt from "bcrypt";
import { getCustomRepository, getConnection } from "typeorm";
import Advisor from "../../models/advisor";
import City from "../../models/city";
import Country from "../../models/country";
import Course from "../../models/course";
import Member from "../../models/member";
import Preference from "../../models/preference";
import State from "../../models/state";
import Team from "../../models/team";
import User from "../../models/user";
import UserRepo from "../../repos/user";
import IAdvisorDataWithId from "../../types/advisor/IAdvisorDataWithId";
import IMemberDataWithId from "../../types/member/IMemberDataWithId";
import IModeratorData from "../../types/moderator/IModeratorData";
import IUserTeamData from "../../types/team/IUserTeamData";
import getModeratorData from "../queries/getModeratorData";
import isInAgreement from "../queries/isInAgreement";

export default async function tryLogin (email: string, password: string): Promise<false|IUserTeamData|IModeratorData> {
  const userRepo = getCustomRepository(UserRepo);
  const user = await userRepo.createQueryBuilder("user")
    .select("user.password", "password")
    .addSelect("user.id", "id")
    .where("user.email = :email", { email })
    .getRawOne<{ password: string, id: string } | undefined>()
  ;

  if (!user) {
    return false;
  }

  const result = await bcrypt.compare(password, user.password);

  if (!result) {
    return false;
  }

  const connection = getConnection();
  const teamData = await connection.createQueryBuilder()
    .select("team.id", "id")
    .addSelect("user.name", "name")
    .addSelect("team.logo_url", "logoURL")
    .addSelect("course.name", "course")
    .addSelect("team.theme_name", "theme")
    .addSelect("concat(city.name, ', ', state.name, ' - ', country.name)", "city")
    .addSelect("team.theme_description", "themeDescription")
    .addSelect("team.portfolio", "portfolio")
    .addSelect("user.is_verified", "isVerified")
    .addSelect("team.is_active", "isActive")
    .addSelect("count(preference.id) > 0", "hasPreferences")
    .from(Team, "team")
    .innerJoin(User, "user", "user.id = team.user_id")
    .innerJoin(Course, "course", "course.id = team.course_id")
    .innerJoin(City, "city", "city.id = team.city_id")
    .innerJoin(State, "state", "state.id = city.state_id")
    .innerJoin(Country, "country", "country.id = state.country_id")
    .leftJoin(Preference, "preference", "team.id = preference.team_id")
    .groupBy("preference.team_id")
    .addGroupBy("team.id")
    .addGroupBy("user.name")
    .addGroupBy("course.name")
    .addGroupBy("city.name")
    .addGroupBy("state.name")
    .addGroupBy("country.name")
    .addGroupBy("user.is_verified")
    .where("user.id = :id", { id: user.id })
    .getRawOne<IUserTeamData>()
  ;

  if (!teamData) {
    const moderator = await getModeratorData(connection)
      .where("user.id = :id", { id: user.id })
      .getRawOne<IModeratorData | undefined>()
    ;

    if (!moderator) {
      return false;
    }
    
    moderator.isVerified = Boolean(moderator.isVerified);
    moderator.isModerator = true;

    return moderator;
  }

  teamData.isVerified = Boolean(teamData.isVerified);
  teamData.isActive = Boolean(teamData.isActive);
  teamData.hasPreferences = Boolean(teamData.hasPreferences);
  teamData.isInAgreement = !!(await isInAgreement(teamData.id, connection).getRawOne());

  teamData.members = await connection.createQueryBuilder()
    .select("member.id", "id")
    .addSelect("member.name", "name")
    .addSelect("member.photo_url", "photoURL")
    .addSelect("member.role", "role")
    .addSelect("member.birthday", "birthday")
    .addSelect("member.description", "description")
    .from(Member, "member")
    .where("member.team_id = :id", { id: teamData.id })
    .getRawMany() as IMemberDataWithId[];

  teamData.advisors = await connection.createQueryBuilder()
    .select("advisor.id", "id")
    .addSelect("advisor.name", "name")
    .addSelect("advisor.photo_url", "photoURL")
    .addSelect("advisor.email", "email")
    .from(Advisor, "advisor")
    .where("advisor.team_id = :id", { id: teamData.id })
    .getRawMany() as IAdvisorDataWithId[];
  
  return teamData;
}