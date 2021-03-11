import { ConfigProvider } from '@library/configs';

import { User, Sequelize } from './shared';

export class PostgresqlProvider {

  public static local = 'localPostgresql';

  public static getProviders() {
    return [
      {
        provide: this.local,
        inject: [ConfigProvider],

        useFactory: async (configs: ConfigProvider) => {
          const postgresql = new Sequelize(configs.info.database);
          postgresql.addModels([User]);
          if (configs.info.env === 'dev') await postgresql.sync(); // It is not recommended to enable it in production
          return postgresql;
        },
      },
    ];
  }
}
