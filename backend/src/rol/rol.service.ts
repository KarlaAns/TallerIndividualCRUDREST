import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { UpdateRolDto } from './dto/update-rol.dto.js';
import { Rol } from './entities/rol.entity.js';
import { manejarErrorBd } from '../common/errores-bd.js';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto) {
    try {
      return await this.rolRepository.save(this.rolRepository.create(createRolDto));
    } catch (error) {
      manejarErrorBd(error, { unico: `Ya existe un rol con el nombre ${createRolDto.nombre}` });
    }
  }

  findAll() {
    return this.rolRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: string) {
    const rol = await this.rolRepository.findOneBy({ id_rol: id });
    if (!rol) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    return rol;
  }

  async update(id: string, updateRolDto: UpdateRolDto) {
    const rol = await this.findOne(id);
    this.rolRepository.merge(rol, updateRolDto);
    try {
      return await this.rolRepository.save(rol);
    } catch (error) {
      manejarErrorBd(error, { unico: `Ya existe un rol con el nombre ${updateRolDto.nombre}` });
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.rolRepository.delete({ id_rol: id });
    } catch (error) {
      manejarErrorBd(error, { fk: 'No se puede eliminar: el rol está asignado a usuarios' });
    }
    return { mensaje: 'Rol eliminado', id_rol: id };
  }
}
