import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1583121828027 implements MigrationInterface {
    name = 'CreateUserTable1583121828027';

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" VARCHAR NOT NULL, "first_name" VARCHAR NOT NULL, "last_name" VARCHAR NOT NULL, "password" VARCHAR NOT NULL, "password_reset_hash" VARCHAR, "session_salt" VARCHAR, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e23" UNIQUE ("email"))`);
      await queryRunner.query(`CREATE INDEX "IDX_c928a59be916455a50b4bd7b53" ON "user" ("email", "session_salt") `);
      await queryRunner.query(`CREATE INDEX "IDX_a43f27b33c034a12d2a40c9bae" ON "user" ("password_reset_hash") `);
      await queryRunner.query(`CREATE INDEX "IDX_da3c61e7116eb857358ea360a2" ON "user" ("session_salt") `);
      await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP INDEX "IDX_e12875dfb3b1d92d7d7c5377e2"`);
      await queryRunner.query(`DROP INDEX "IDX_da3c61e7116eb857358ea360a2"`);
      await queryRunner.query(`DROP INDEX "IDX_a43f27b33c034a12d2a40c9bae"`);
      await queryRunner.query(`DROP INDEX "IDX_c928a59be916455a50b4bd7b53"`);
      await queryRunner.query(`DROP TABLE "user"`);
    }

}
