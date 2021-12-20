import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class advisor0000000000020 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "advisor",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "team_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "name",
            type: "varchar",
            isNullable: false
          },

          {
            name: "email",
            type: "varchar",
            isNullable: false
          },

          {
            name: "photo_url",
            type: "text",
            isNullable: true
          },

          {
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ],
        foreignKeys: [
          {
            name: 'fk_advisor_team',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["team_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("advisor");
  }

}
