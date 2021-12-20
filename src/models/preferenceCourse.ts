import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import Course from "./course";
import Preference from "./preference";


@Entity("preference_course")
export default class PreferenceCourse {
  
  @PrimaryColumn({ type: "varchar", name: "preference_id" })
  @ManyToOne(() => Preference, preference => preference.preferenceCourses, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "preference_id" })
  preference: Preference;

  @PrimaryColumn({ type: "varchar", name: "course_id" })
  @ManyToOne(() => Course, course => course.preferenceCourses, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "course_id" })
  course: Course;

}