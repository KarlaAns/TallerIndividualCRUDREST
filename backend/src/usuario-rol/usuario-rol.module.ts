import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioRol } from './entities/usuario-rol.entity.js';
import { UsuarioRolService } from './usuario-rol.service.js';
import { UsuarioRolController } from './usuario-rol.controller.js';
import { UsuarioModule } from '../usuario/usuario.module.js';
import { RolModule } from '../rol/rol.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioRol]), UsuarioModule, RolModule],
  controllers: [UsuarioRolController],
  providers: [UsuarioRolService],
})
export class UsuarioRolModule {}
