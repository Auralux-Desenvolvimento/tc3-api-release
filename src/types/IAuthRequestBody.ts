import Team from "../models/team";

export default interface IAuthRequestBody<T = Team> {
  user: T;
}

export interface IAuthSelfOrModeratorRequestBody extends IAuthRequestBody {
  subject: Team;
}