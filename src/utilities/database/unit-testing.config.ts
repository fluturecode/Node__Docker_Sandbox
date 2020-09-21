import { ConnectionOptions } from 'typeorm';
import { TypeOrmConfig } from './typeorm.config';

import environment from '@environment';

const dbHost: string = environment.node_env === 'test'
    ? 'localhost'
    : environment.db_host;

export const UnitTestingTypeOrmConfig: ConnectionOptions = Object.assign({}, TypeOrmConfig, {
    name: 'unit_tests',
    database: 'test_db',
    host: dbHost
});