import Joi from '@hapi/joi';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Wamp } from './Wamp';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env.development',
      validationSchema: Joi.object({
        CROSSBAR_URI: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [Wamp],
})
export class WampModule {}
