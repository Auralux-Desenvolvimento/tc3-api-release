import IListItemTeam from "./IListItemTeam";

export default interface ITeamData extends IListItemTeam {
  themeDescription?: string|null;
  portfolio?: object|null;
}