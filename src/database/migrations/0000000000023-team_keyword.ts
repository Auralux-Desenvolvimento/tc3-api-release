import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class team_keyword0000000000023 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "team_keyword",
        columns: [
          {
            name: "team_id",
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
            name: 'fk_team_keyword_team',
            referencedTableName: "team",
            referencedColumnNames: ["id"],
            columnNames: ["team_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          {
            name: 'fk_team_keyword_keyword',
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
    await queryRunner.dropTable("team_keyword");
  }
}
