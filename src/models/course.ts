import { IsOptional, IsString, IsUUID, MaxLength, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import PreferenceCourse from "./preferenceCourse";
import Team from "./team";

@Entity("course")
export default class Course {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar", { length: 254, unique: true })
  @IsString({ message: "A course name must be a string" })
  @MaxLength(254, { message: "A course name must have a length of up to 254 characters" })
  name: string;

  @OneToMany(() => Team, team => team.course, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  teams: Team[];

  @OneToMany(() => PreferenceCourse, preferenceCourse => preferenceCourse.course, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  preferenceCourses: PreferenceCourse[];

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