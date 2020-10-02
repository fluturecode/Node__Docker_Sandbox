import { MigrationInterface, QueryRunner } from "typeorm";

export class CamelCaseUserColumns1593121928028 implements MigrationInterface {
    name = 'CamelCaseUserColumns1593121928028';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "IDX_da3c61e7116eb857358ea360a2"`);
        await queryRunner.query(`DROP INDEX "IDX_a43f27b33c034a12d2a40c9bae"`);
        await queryRunner.query(`DROP INDEX "IDX_c928a59be916455a50b4bd7b53"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "session_salt" TO "sessionSalt"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "password_reset_hash" TO "temporaryTokenHash"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "first_name" TO "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "last_name" TO "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profilePicture" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "activatedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_3f9d1c1010b05a0bdc53a13d19" ON "user" ("email", "sessionSalt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_3f9d1c1010b05a0bdc53a13d19"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "activatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profilePicture"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "sessionSalt" TO "session_salt"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "temporaryTokenHash" TO "password_reset_hash"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "firstName" TO "first_name"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "lastName" TO "last_name"`);
        await queryRunner.query(`CREATE INDEX "IDX_c928a59be916455a50b4bd7b53" ON "user" ("email", "session_salt") `);
        await queryRunner.query(`CREATE INDEX "IDX_a43f27b33c034a12d2a40c9bae" ON "user" ("password_reset_hash") `);
        await queryRunner.query(`CREATE INDEX "IDX_da3c61e7116eb857358ea360a2" ON "user" ("session_salt") `);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    }

}
