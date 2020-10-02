import { EntityRepository, Repository } from "typeorm";

import { Address } from "@models";

@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {

}