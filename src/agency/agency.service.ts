import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgencyRepository, Agency, User } from '@entities';
import { AgencyCreationDto } from './dto/agency-creation.dto';
import { AgencyUpdateDto } from './dto/agency-update.dto';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(AgencyRepository)
    private agencyRepository: AgencyRepository
  ) {}

  async createAgency(currentUser: User, agencyData: AgencyCreationDto): Promise<Agency> {
    return this.agencyRepository.create({
      createdBy: currentUser.id,
      ...agencyData
    }).save();
  }

  async getAllAgencies(): Promise<Agency[]> {
    return this.agencyRepository.find({});
  }

  async getSingleAgency(id: number): Promise<Agency> {
    const agency: Agency = await this.agencyRepository.findOne({id});

    if (!agency) {
      throw new NotFoundException(`Unable to find agency with id: ${id}`);
    }

    return agency;
  }

  async softDeleteAgency(currentUser: User, id: number): Promise<Agency> {
    const agency: Agency = await this.getSingleAgency(id);

    agency.softDelete(currentUser.id);

    return agency.save();
  }

  async updateSingleAgency(id: number, agencyData: AgencyUpdateDto): Promise<Agency> {
    const agency: Agency = await this.getSingleAgency(id);

    Object.assign(agency, agencyData);

    return agency.save();
  }
}
