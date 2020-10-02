import { Repository, getRepository } from "typeorm";
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Agency } from "@models";

export class AgencySeeder {
  baseAgencies: Partial<Agency>[] = [
    { agencyName: 'Main' },
    { agencyName: 'Public' }
  ];

  constructor() {}

  public async seed(): Promise<void> {
    const agencyRepository: Repository<Agency> = getRepository('Agency');

    await Promise.all(this.baseAgencies.map(async (agency: Partial<Agency>) => {
      const existingAgency: Agency = await agencyRepository.findOne({ agencyName: agency.agencyName });

      if (!existingAgency) {
        Logger.log(`Seeding ${agency.agencyName} agency`, 'AgencySeeder');

        try {
          await agencyRepository.save(agency);
        } catch (error) {
          throw new InternalServerErrorException(`Unable to seed agency - \n\n${error}`);
        }
      }
    }));

    Logger.log('All base agencies seeded!', 'AgencySeeder');
  }
}