import { MigrationInterface, QueryRunner, InsertResult } from "typeorm";
import { Agency } from "@models";

export class AgencyIdNotNullable1598294879948 implements MigrationInterface {
    name = 'AgencyIdNotNullable1598294879948';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agency" ADD CONSTRAINT "UQ_b41b286cc1019d386f6dfd5aa61" UNIQUE ("agencyName")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ffe98999bc6a1edce7af102f74c"`);

        let mainTenancy: Partial<Agency> = await queryRunner.manager
            .createQueryBuilder(Agency, 'agency')
            .select()
            .where("agency.agencyName = :name", { name: "Main" })
            .getOne();

        if (!mainTenancy) {
            const insertedAgency: InsertResult = await queryRunner.manager
                .createQueryBuilder(Agency, 'agency')
                .insert()
                .into(Agency)
                .values({
                    agencyName: 'Main',
                    deletedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: null,
                    deletedBy: null
                })
                .execute();

            mainTenancy = insertedAgency.identifiers[0];
        }

        await queryRunner.query(`UPDATE "user" SET "agencyId" = ${mainTenancy.id}`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "agencyId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ffe98999bc6a1edce7af102f74c" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ffe98999bc6a1edce7af102f74c"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "agencyId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ffe98999bc6a1edce7af102f74c" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agency" DROP CONSTRAINT "UQ_b41b286cc1019d386f6dfd5aa61"`);
    }

}
