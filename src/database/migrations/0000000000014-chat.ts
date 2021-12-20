import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class chat0000000000014 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "chat",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "team1_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "team2_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "status",
            type: "enum",
            enum: ["active", "in_agreement", "banned", "inactive"],
            default: `'inactive'`,
            isNullable: false
          },

          {
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ],
        foreignKeys: [
          {
            name: 'fk_chat_team1',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["team1_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_chat_team2',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["team2_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("chat");
  }

}
