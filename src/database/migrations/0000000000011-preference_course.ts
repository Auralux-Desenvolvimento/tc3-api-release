import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class preference_course0000000000011 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "preference_course",
        columns: [
          {
            name: "preference_id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "course_id",
            type: "varchar",
            isPrimary: true
          },
        ],
        foreignKeys: [
          {
            name: 'fk_preference_course_preference',
            referencedTableName: "preference",
            referencedColumnNames: ["id"],
            columnNames: ["preference_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_preference_course_course',
            referencedTableName: "course",
            referencedColumnNames: ["id"],
            columnNames: ["course_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("preference_course");
  }

}
