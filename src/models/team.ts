import { IsBoolean, IsDate, IsObject, IsOptional, IsString, IsUrl, IsUUID, MaxLength, validateOrReject } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import City from "./city";
import Course from "./course";
import Member from './member';
import Preference from "./preference";
import Interest from "./interest";
import Favourite from "./favourite";
import Chat from "./chat";
import Agreement from "./agreement";
import Message from "./message";
import Report from "./report";
import User from "./user";
import Advisor from "./advisor";
import IDraftContent from "../types/portfolio/IDraftContent";
import TeamKeyword from "./teamKeyword";

@Entity("team")
export default class Team {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @ManyToOne(() => User, user => user.teams, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Interest, interest => interest.agent, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  agentInterest: Interest[];

  @OneToMany(() => Interest, interest => interest.subject, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  subjectInterest: Interest[];

  @OneToMany(() => Favourite, favourite => favourite.agent, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  agentFavourite: Favourite[];

  @OneToMany(() => Favourite, favourite => favourite.subject, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  subjectFavourite: Favourite[];

  @OneToMany(() => Chat, chat => chat.team1, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  team1: Chat[];

  @OneToMany(() => Chat, chat => chat.team2, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  team2: Chat[];

  @OneToMany(() => Agreement, agreement => agreement.agent, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  agentAgreement: Agreement[];

  @OneToMany(() => Message, message => message.agent, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  agentMessage: Message[];

  @OneToMany(() => Message, message => message.subject, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  subjectMessage: Message[];

  @OneToMany(() => Report, report => report.reporterTeam, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  reporterTeam: Report[];

  @OneToMany(() => TeamKeyword, teamKeyword => teamKeyword.team, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  teamKeywords: TeamKeyword[];

  @OneToMany(() => Report, report => report.reportedTeam, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  reportedTeam: Report[];

  @ManyToOne(() => Course, course => course.teams, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  @JoinColumn({ name: "course_id" })
  course: Course;

  @ManyToOne(() => City, city => city.teams, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "city_id" })
  city: City;

  @Column("text", { name: "logo_url", nullable: true })
  @IsString({ message: "A team's logo url must be a string" })
  @IsUrl({}, { message: "A team's logo url must be an url" })
  @IsOptional()
  logoURL?: string|null;

  @Column("json", { nullable: true })
  @IsObject({ message: "A team portfolio must be an object" })
  @IsOptional()
  portfolio?: IDraftContent|null;

  @Column("varchar", { name: "theme_name", length: 200, nullable: true })
  @IsString({ message: "A team's theme name must be a string" })
  @MaxLength(254, { message: "A team's theme name must have a length of up to 254 characters" })
  @IsOptional()
  themeName?: string|null;
  
  @Column("text", { name: "theme_description", nullable: true })
  @IsString({ message: "A team's theme description must be a string" })
  @IsOptional()
  themeDescription?: string|null;

  @Column("boolean", { name: "is_active", default: true })
  @IsBoolean({ message: "The team's 'isActive' state must be a boolean" })
  @IsOptional()
  isActive?: boolean;

  @Column("timestamp", { name: "last_seen", default: () => "now()" })
  @IsDate({ message: "lastSeen must be a date" })
  @IsOptional()
  lastSeen: Date;

  @OneToMany(() => Member, member => member.team, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  members: Member[];

  @OneToMany(() => Advisor, advisor => advisor.team, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  advisors: Advisor[];

  @OneToMany(() => Preference, preference => preference.team, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  preferences: Preference[];
  
  constructor() {
    if(!this.id) {
      this.id = uuid();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validate () {
    await validateOrReject(this);
  }
}