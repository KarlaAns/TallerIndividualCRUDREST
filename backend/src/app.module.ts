import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';
import pg from 'pg';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PersonaModule } from './persona/persona.module.js';
import { UsuarioModule } from './usuario/usuario.module.js';
import { RolModule } from './rol/rol.module.js';
import { UsuarioRolModule } from './usuario-rol/usuario-rol.module.js';

// PostgreSQL en Docker trabaja en UTC: las columnas TIMESTAMP (sin zona) se leen
// como UTC para que fecha_creacion y fecha_asignacion no salgan con 5 h de desfase.
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (valor: string) =>
  new Date(valor.replace(' ', 'T') + 'Z'),
);

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Lee POSTGRES_PASSWORD del .env de la raíz (el mismo que usa docker-compose)
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),

    // Conexión con el contenedor biblioteca-postgres
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5434,
        username: 'biblioteca',
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: 'biblioteca_db',
        autoLoadEntities: true,
        // Las tablas ya existen (database/01_schema.sql); TypeORM no las modifica
        synchronize: false,
      }),
    }),

    // Telemetría de NestJS (no envía nada hasta ejecutar `npx @nestjs/observe link`)
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),

    PersonaModule,
    UsuarioModule,
    RolModule,
    UsuarioRolModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
