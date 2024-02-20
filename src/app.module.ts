import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guards';


@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '666666',
      database: 'nadonamore',
      autoLoadModels: true, // Автоматическая загрузка моделей
      synchronize: true,
      models: [join(__dirname, 'models/')]    
    }),
    AuthModule,
    // To enable `configModule` for all routes
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ... другие модули
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AtGuard }]
})
export class AppModule {}
