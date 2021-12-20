import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class state0000000000003 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "state",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "country_id",
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
            name: 'fk_state_country',
            referencedTableName: "country",
            referencedColumnNames: ["id"],
            columnNames: ["country_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("state");
  }

}
