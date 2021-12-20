import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class city0000000000004 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "city",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "state_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "name",
            type: "varchar",
            isNullable: false
          }
        ],
        foreignKeys: [
          {
            name: 'fk_city_state',
            referencedTableName: "state",
            referencedColumnNames: ["id"],
            columnNames: ["state_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("city");
  }

}
