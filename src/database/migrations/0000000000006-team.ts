import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class team0000000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "team",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "user_id",
          type: "varchar",
          isNullable: false
        },
        {
          name: "course_id",
          type: "varchar",
          isNullable: true
        },
        {
          name: "city_id",
          type: "varchar",
          isNullable: true
        },
        {
          name: "logo_url",
          type: "text",
          isNullable: true
        },
        {
          name: "portfolio",
          type: "json",
          isNullable: true
        },
        {
          name: "theme_name",
          type: "varchar",
          isNullable: true
        },
        {
          name: "theme_description",
          type: "varchar",
          isNullable: true
        },
        {
          name: "is_active",
          type: "boolean",
          default: true
        },
        {
          name: "last_seen",
          type: "timestamp",
          default: "now()"
        },
      ],
      foreignKeys: [
        {
          name: 'fk_team_course',
          referencedTableName: "course",
          referencedColumnNames: ["id"],
          columnNames: ["course_id"],
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
        },
        {
          name: 'fk_team_city',
          referencedTableName: "city",
          referencedColumnNames: ["id"],
          columnNames: ["city_id"],
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        {
          name: 'fk_team_user',
          referencedTableName: "user",
          referencedColumnNames: ["id"],
          columnNames: ["user_id"],
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("team");
  }

}