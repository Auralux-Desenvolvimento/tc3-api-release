import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";
import { v4 as uuid } from "uuid";
import ModKeys from "../../models/modKeys";

export class mod_keys0000000000018 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "mod_keys",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true
          },

          {
            name: "issuer_id",
            type: "varchar",
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
            name: 'fk_mod_keys_issuer',
            referencedTableName: "moderator",
            referencedColumnNames: ["id"],
            columnNames: ["issuer_id"],
            onUpdate: "CASCADE",
            onDelete: "NO ACTION",
          }
        ]
      })
    )

    await queryRunner.createForeignKey("moderator", new TableForeignKey({
      name: 'fk_moderator_mod_keys',
      referencedTableName: "mod_keys",
      referencedColumnNames: ["id"],
      columnNames: ["mod_key_id"],
      onUpdate: "CASCADE",
      onDelete: "NO ACTION",
    }))

    const modKey = await queryRunner.manager.createQueryBuilder().insert()
      .into(ModKeys)
      .values([
        { id: uuid() }
      ])
      .execute()
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("mod_keys");
  }
}
