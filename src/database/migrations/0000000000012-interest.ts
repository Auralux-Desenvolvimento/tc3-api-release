import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class interest0000000000012 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "interest",
        columns: [
          {
            name: "agent_id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "subject_id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "is_positive",
            type: "boolean",
            isNullable: false,
          },

          {
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ],
        foreignKeys: [
          {
            name: 'fk_interest_agent',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["agent_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_interest_subject',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["subject_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("interest");
  }

}
