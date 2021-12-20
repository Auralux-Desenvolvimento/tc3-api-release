import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class country0000000000002 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table ({
        name: "country",
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
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("country");
  }

}
