import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class preference0000000000010 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "preference",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "team_id",
            type: "varchar"
          },

          {
            name: "city_id",
            type: "varchar",
            isNullable: true
          },

          {
            name: "state_id",
            type: "varchar",
            isNullable: true
          },

          {
            name: "theme_preference",
            type: "boolean",
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
            name: 'fk_preference_team',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["team_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_preference_city',
            referencedTableName: "city",
            referencedColumnNames: ["id"],
            columnNames: ["city_id"],
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },

          {
            name: 'fk_preference_state',
            referencedTableName: "state",
            referencedColumnNames: ["id"],
            columnNames: ["state_id"],
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("preference");
  }

}
