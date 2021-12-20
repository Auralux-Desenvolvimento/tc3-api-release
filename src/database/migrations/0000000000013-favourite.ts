import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class favourite0000000000013 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "favourite",
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
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ],
        foreignKeys: [
          {
            name: 'fk_favourite_agent',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["agent_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_favourite_subject',
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
    await queryRunner.dropTable("favourite");
  }

}
