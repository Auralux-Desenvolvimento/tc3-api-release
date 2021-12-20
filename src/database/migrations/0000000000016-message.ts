import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class message0000000000016 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "message",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "chat_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "agent_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "subject_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "content",
            type: "text",
            isNullable: false
          },

          {
            name: "seen",
            type: "boolean",
            isNullable: false,
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
            name: 'fk_message_agent',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["agent_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_message_subject',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["subject_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_message_chat',
            referencedTableName: "chat",
            referencedColumnNames: ["id"],
            columnNames: ["chat_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("message");
  }

}
