import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class user0000000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "user",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "name",
          type: "varchar",
        },
        {
          name: "email",
          type: "varchar",
          isUnique: true
        },
        {
          name: "password",
          type: "text"
        },
        {
          name: "is_verified",
          type: "boolean",
          default: false
        },
        {
          name: "created_at",
          type: "timestamp",
          default: "now()"
        },
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("user");
  }
}