import { EntityRepository, Repository } from "typeorm";

import { Agency } from '@entities';

@EntityRepository(Agency)
export class AgencyRepository extends Repository<Agency> {

}