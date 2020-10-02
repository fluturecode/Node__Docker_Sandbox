import { ConnectionOptions } from 'typeorm';
import { UnitTestingTypeOrmConfig } from './unit-testing.config';

export const EndToEndTestingTypeOrmConfig: ConnectionOptions = Object.assign({}, UnitTestingTypeOrmConfig, { name: 'e2e_testing', database: 'test_db' });