import { Module } from '@nestjs/common';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyRepository } from '@models';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgencyRepository
    ])
  ],
  controllers: [AgencyController],
  providers: [AgencyService]
})
export class AgencyModule {}
