import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAgency1597963373804 implements MigrationInterface {
    name = 'UserAgency1597963373804';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "agency" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "agencyName" character varying NOT NULL, "createdById" integer, "deletedById" integer, CONSTRAINT "PK_ab1244724d1c216e9720635a2e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b41b286cc1019d386f6dfd5aa6" ON "agency" ("agencyName") `);
        await queryRunner.query(`ALTER TABLE "user" ADD "agencyId" integer`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roleId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "agency" ADD CONSTRAINT "FK_6e0877e5cb755c1bcfb7a45009c" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agency" ADD CONSTRAINT "FK_7cc65b1dc572525db00a0449f88" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ffe98999bc6a1edce7af102f74c" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ffe98999bc6a1edce7af102f74c"`);
        await queryRunner.query(`ALTER TABLE "agency" DROP CONSTRAINT "FK_7cc65b1dc572525db00a0449f88"`);
        await queryRunner.query(`ALTER TABLE "agency" DROP CONSTRAINT "FK_6e0877e5cb755c1bcfb7a45009c"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roleId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "agencyId"`);
        await queryRunner.query(`DROP INDEX "IDX_b41b286cc1019d386f6dfd5aa6"`);
        await queryRunner.query(`DROP TABLE "agency"`);
    }

}
