import { ConnectionOptions } from 'typeorm';
import environment from '../../environment';

/**
 * Typeorm Config Object
 * Everything here is pulled from the environment except the database type
 * which is controlled through a Typeorm enum and must be hard coded
 */

export const typeOrmConfig: ConnectionOptions = {
    type: 'postgres',
    host: environment.db_host,
    port: environment.db_port,
    username: environment.db_user,
    password: environment.db_password,
    database: environment.db_name,
    entities: [
        `${__dirname}/../../entities/**/*.entity.{js,ts}`
    ],
    migrations: [
        `${__dirname}/../../migrations/*.{js,ts}`
    ],
    synchronize: true
};