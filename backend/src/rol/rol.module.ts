import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity.js';
import { RolService } from './rol.service.js';
import { RolController } from './rol.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  controllers: [RolController],
  providers: [RolService],
  exports: [RolService],
})
export class RolModule {}
