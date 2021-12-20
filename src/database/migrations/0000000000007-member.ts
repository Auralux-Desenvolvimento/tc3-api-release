import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class member0000000000007 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "member",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "team_id",
            type: "varchar",
          },

          {
            name: "name",
            type: "varchar",
          },

          {
            name: "photo_url",
            type: "text",
            isNullable: true
          },

          {
            name: "role",
            type: "varchar",
          },

          {
            name: "birthday",
            type: "date",
          },

          {
            name: "description",
            type: "varchar",
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
            name: 'fk_member_team',
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
    await queryRunner.dropTable("member");
  }

}
