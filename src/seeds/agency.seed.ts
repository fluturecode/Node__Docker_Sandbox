import { Repository, getRepository } from "typeorm";
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Agency } from "@entities";

export class AgencySeeder {
  constructor() {}

  public async seed(): Promise<void> {
    const agencyRepository: Repository<Agency> = getRepository('Agency'),
      existingMainAgency: Agency = await agencyRepository.findOne({ agencyName: 'Main' });

    if (!existingMainAgency) {
      Logger.log('Seeding main agency', 'AgencySeeder');

      try {
        await agencyRepository.save({ agencyName: 'Main' });

        Logger.log('Main Agency seeded!', 'AgencySeeder');
      } catch (error) {
        throw new InternalServerErrorException(`Unable to seed agency - \n\n${error}`);
      }
    }
  }
}