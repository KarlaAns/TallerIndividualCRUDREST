import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { Usuario } from './entities/usuario.entity.js';
import { PersonaService } from '../persona/persona.service.js';
import { manejarErrorBd } from '../common/errores-bd.js';

const RONDAS_HASH = 10;

// Lógica CRUD de usuario: valida la FK a persona y aplica hash a la contraseña
@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly personaService: PersonaService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { password, ...datos } = createUsuarioDto;
    await this.personaService.findOne(datos.id_persona); // 404 si la persona no existe

    // Una persona no puede compartir su cuenta con otro usuario
    if (await this.usuarioRepository.existsBy({ id_persona: datos.id_persona })) {
      throw new ConflictException('La persona ya tiene un usuario');
    }

    const usuario = this.usuarioRepository.create({
      ...datos,
      password_hash: await bcrypt.hash(password, RONDAS_HASH),
    });
    let id: string;
    try {
      id = (await this.usuarioRepository.save(usuario)).id_usuario;
    } catch (error) {
      manejarErrorBd(error, { unico: `El username ${datos.username} ya está registrado` });
    }
    return this.findOne(id); // se devuelve sin password_hash
  }

  findAll() {
    return this.usuarioRepository.find({
      relations: { persona: true },
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: id },
      relations: { persona: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);
    const { password, ...datos } = updateUsuarioDto;
    const cambios: Partial<Usuario> = { ...datos };
    if (password) {
      cambios.password_hash = await bcrypt.hash(password, RONDAS_HASH);
    }
    if (Object.keys(cambios).length > 0) {
      try {
        await this.usuarioRepository.update({ id_usuario: id }, cambios);
      } catch (error) {
        manejarErrorBd(error, { unico: `El username ${datos.username} ya está registrado` });
      }
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.usuarioRepository.delete({ id_usuario: id });
    } catch (error) {
      manejarErrorBd(error, { fk: 'No se puede eliminar: el usuario tiene roles asignados' });
    }
    return { mensaje: 'Usuario eliminado', id_usuario: id };
  }
}
