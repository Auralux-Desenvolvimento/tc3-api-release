import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class agreement0000000000015 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "agreement",
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
            name: "status",
            type: "enum",
            enum: ["pending", "rejected", "cancelled", "active"],
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
            name: 'fk_agreement_chat',
            referencedTableName: "chat",
            referencedColumnNames: ["id"],
            columnNames: ["chat_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_agreement_agent',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["agent_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("agreement");
  }

}
