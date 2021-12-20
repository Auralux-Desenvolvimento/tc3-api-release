import { IsBoolean, IsOptional, IsUUID, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import City from "./city";
import PreferenceCourse from "./preferenceCourse";
import PreferenceKeyword from "./preferenceKeyword";
import State from "./state";
import Team from "./team";

@Entity("preference")
export default class Preference {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => Team, team => team.preferences, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "team_id" })
  team: Team;

  @ManyToOne(() => City, city => city.preferences, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "city_id" })
  city?: City;

  @ManyToOne(() => State, state => state.preferences, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "state_id" })
  state?: State;

  @Column("boolean", { name: "theme_preference" })
  @IsBoolean({ message: "The preference for a theme must be a boolean" })
  @IsOptional()
  themePreference?: boolean;

  @OneToMany(() => PreferenceCourse, preferenceCourse => preferenceCourse.preference, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  preferenceCourses: PreferenceCourse[];

  @OneToMany(() => PreferenceKeyword, preferenceKeyword => preferenceKeyword.preference, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  preferenceKeywords: PreferenceKeyword[];

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  readonly createdAt: Date;

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