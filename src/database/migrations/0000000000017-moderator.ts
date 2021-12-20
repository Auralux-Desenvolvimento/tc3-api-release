import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class moderator0000000000017 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "moderator",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },
          {
            name: "user_id",
            type: "varchar",
            isNullable: false
          },
          {
            name: "mod_key_id",
            type: "varchar",
            isNullable: false
          },
        ],
        foreignKeys: [
          {
            name: 'fk_moderator_user',
            referencedTableName: "user",
            referencedColumnNames: ["id"],
            columnNames: ["user_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("moderator");
  }
}
