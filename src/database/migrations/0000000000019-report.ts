import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class report0000000000019 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "report",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "reporter_id",
            type: "varchar",
            isNullable: true
          },

          {
            name: "reported_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "message",
            type: "text",
            isNullable: false
          },

          {
            name: "chat_id",
            type: "varchar",
            isNullable: true
          },

          {
            name: "moderator_id",
            type: "varchar",
            isNullable: true
          },

          {
            name: "is_resolved",
            type: "boolean",
            default: false
          },

          {
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ],
        foreignKeys: [
          {
            name: 'fk_report_reporter',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["reporter_id"],
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          
          {
            name: 'fk_report_reported',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["reported_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_report_chat',
            referencedTableName: "chat",
            referencedColumnNames: ["id"],
            columnNames: ["chat_id"],
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },

          {
            name: 'fk_report_moderator',
            referencedTableName: "moderator",
            referencedColumnNames: ["id"],
            columnNames: ["moderator_id"],
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("report");
  }

}
