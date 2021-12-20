import ICompleteTeamData from "./ICompleteTeamData";

export default interface IUserTeamData extends ICompleteTeamData {
  isVerified: boolean;
  isActive?: boolean;
  hasPreferences: boolean;
  isInAgreement: boolean;
}