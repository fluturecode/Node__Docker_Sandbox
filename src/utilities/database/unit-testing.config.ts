import { ConnectionOptions } from 'typeorm';
import { TypeOrmConfig } from './typeorm.config';

export const UnitTestingTypeOrmConfig: ConnectionOptions = Object.assign({}, TypeOrmConfig, {
    name: 'unit_tests',
    database: 'test_db',
    host: 'localhost'
});