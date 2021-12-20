import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class preference_keyword0000000000024 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "preference_keyword",
        columns: [
          {
            name: "preference_id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "keyword_id",
            type: "varchar",
            isPrimary: true
          }
        ],
        foreignKeys: [
          {
            name: 'fk_preference_keyword_preference',
            referencedTableName: "preference",
            referencedColumnNames: ["id"],
            columnNames: ["preference_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_preference_keyword_keyword',
            referencedTableName: "keyword",
            referencedColumnNames: ["id"],
            columnNames: ["keyword_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("preference_keyword");
  }
}
