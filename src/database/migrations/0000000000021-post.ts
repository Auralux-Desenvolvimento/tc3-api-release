import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class advisor0000000000021 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "post",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "moderator_id",
            type: "varchar",
            isNullable: false
          },

          {
            name: "title",
            type: "varchar",
            isNullable: false
          },

          {
            name: "content",
            type: "json",
            isNullable: true
          },

          {
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ],
        foreignKeys: [
          {
            name: 'fk_post_moderator',
            referencedTableName: "moderator",
            referencedColumnNames: ["id"],
            columnNames: ["moderator_id"],
            onUpdate: "CASCADE",
            onDelete: "NO ACTION",
          },
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("advisor");
  }

}
