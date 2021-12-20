import {Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import Keyword from "./keyword";
import Preference from "./preference";

@Entity("preference_keyword")
export default class PreferenceKeyword {
  @PrimaryColumn({ type: "varchar", name: "keyword_id" })
  @ManyToOne(() => Keyword, keyword => keyword.preferenceKeyword, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "keyword_id" })
  keyword: Keyword;

  @PrimaryColumn({ type: "varchar", name: "preference_id" })
  @ManyToOne(() => Preference, preference => preference.preferenceKeywords, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "preference_id" })
  preference: Preference;
}