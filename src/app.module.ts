import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';

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
    // ... другие модули
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
