import { MigrationInterface, QueryRunner } from "typeorm";

export class Agents1598313872233 implements MigrationInterface {
    name = 'Agents1598313872233';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "agent" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "thumbnail" character varying NOT NULL, "createdById" integer, "deletedById" integer, "addressId" integer, "agencyId" integer NOT NULL, CONSTRAINT "REL_0b82f0b04f37c25a503fb3883c" UNIQUE ("addressId"), CONSTRAINT "PK_1000e989398c5d4ed585cf9a46f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "address1" character varying NOT NULL, "address2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "zipCode" character varying NOT NULL, "createdById" integer, "deletedById" integer, "agencyId" integer NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "agent" ADD CONSTRAINT "FK_fd338eb3161b5139aa46549ef56" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent" ADD CONSTRAINT "FK_f7094eb9d025c243e9b06806a9f" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent" ADD CONSTRAINT "FK_0b82f0b04f37c25a503fb3883cf" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent" ADD CONSTRAINT "FK_30bf41b5db651325a6bfb186dcd" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_66b4199652a07c303e67c6aa646" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_8e2017941f288d0f63737e10a32" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_6c0d79acfd34bbf4c64dfd7e8e2" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_6c0d79acfd34bbf4c64dfd7e8e2"`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_8e2017941f288d0f63737e10a32"`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_66b4199652a07c303e67c6aa646"`);
        await queryRunner.query(`ALTER TABLE "agent" DROP CONSTRAINT "FK_30bf41b5db651325a6bfb186dcd"`);
        await queryRunner.query(`ALTER TABLE "agent" DROP CONSTRAINT "FK_0b82f0b04f37c25a503fb3883cf"`);
        await queryRunner.query(`ALTER TABLE "agent" DROP CONSTRAINT "FK_f7094eb9d025c243e9b06806a9f"`);
        await queryRunner.query(`ALTER TABLE "agent" DROP CONSTRAINT "FK_fd338eb3161b5139aa46549ef56"`);
        await queryRunner.query(`DROP TABLE "address"`);
        await queryRunner.query(`DROP TABLE "agent"`);
    }

}
