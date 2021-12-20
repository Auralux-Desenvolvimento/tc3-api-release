import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class keyword0000000000022 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "keyword",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "name",
            type: "varchar",
            isNullable: false,
            isUnique: true
          },

          {
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("keyword");
  }
}
