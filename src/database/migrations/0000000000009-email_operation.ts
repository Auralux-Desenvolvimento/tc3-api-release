import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class email_operation0000000000009 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "email_operation",
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
            name: "operation_type",
            type: "enum",
            enum: ["password", "email"],
            isNullable: false
          },

          {
            name: "expiry_date",
            type: "timestamp",
            isNullable: false
          },

          {
            name: "is_valid",
            type: "boolean",
            default: true
          },

          {
            name: "created_at",
            type: "timestamp",
            default: "now()"
          }
        ],
        foreignKeys: [
          {
            name: 'fk_email_operation_user',
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
    await queryRunner.dropTable("email_operation");
  }

}
