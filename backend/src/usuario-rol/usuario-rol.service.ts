import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto.js';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto.js';
import { UsuarioRol } from './entities/usuario-rol.entity.js';
import { UsuarioService } from '../usuario/usuario.service.js';
import { RolService } from '../rol/rol.service.js';
import { manejarErrorBd } from '../common/errores-bd.js';

// Asignar y revocar roles respetando UNIQUE(id_usuario, id_rol)
@Injectable()
export class UsuarioRolService {
  constructor(
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,
    private readonly usuarioService: UsuarioService,
    private readonly rolService: RolService,
  ) {}

  async create(createUsuarioRolDto: CreateUsuarioRolDto) {
    const { id_usuario, id_rol } = createUsuarioRolDto;
    await this.usuarioService.findOne(id_usuario); // 404 si no existe
    await this.rolService.findOne(id_rol); // 404 si no existe
    if (await this.usuarioRolRepository.existsBy({ id_usuario, id_rol })) {
      throw new ConflictException('El usuario ya tiene asignado ese rol');
    }
    let id: string;
    try {
      id = (await this.usuarioRolRepository.save(this.usuarioRolRepository.create(createUsuarioRolDto)))
        .id_usuario_rol;
    } catch (error) {
      manejarErrorBd(error, { unico: 'El usuario ya tiene asignado ese rol' });
    }
    return this.findOne(id);
  }

  findAll() {
    return this.usuarioRolRepository.find({
      relations: { usuario: true, rol: true },
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async findOne(id: string) {
    const asignacion = await this.usuarioRolRepository.findOne({
      where: { id_usuario_rol: id },
      relations: { usuario: true, rol: true },
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignación usuario_rol con id ${id} no encontrada`);
    }
    return asignacion;
  }

  async update(id: string, updateUsuarioRolDto: UpdateUsuarioRolDto) {
    await this.findOne(id);
    await this.usuarioRolRepository.update({ id_usuario_rol: id }, updateUsuarioRolDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.usuarioRolRepository.delete({ id_usuario_rol: id });
    return { mensaje: 'Rol revocado', id_usuario_rol: id };
  }
}
