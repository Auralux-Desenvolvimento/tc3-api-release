import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class course0000000000001 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "course",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "name",
          type: "varchar",
          isUnique: true
        },
        {
          name: "created_at",
          type: "timestamp",
          default: "now()"
        }
      ] 
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("course");
  }

}
