import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonaDto } from './dto/create-persona.dto.js';
import { UpdatePersonaDto } from './dto/update-persona.dto.js';
import { Persona } from './entities/persona.entity.js';
import { manejarErrorBd } from '../common/errores-bd.js';

// Lógica CRUD de persona
@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  async create(createPersonaDto: CreatePersonaDto) {
    try {
      return await this.personaRepository.save(this.personaRepository.create(createPersonaDto));
    } catch (error) {
      manejarErrorBd(error, {
        unico: `Ya existe una persona con identificación ${createPersonaDto.identificacion}`,
      });
    }
  }

  findAll() {
    return this.personaRepository.find({ order: { apellidos: 'ASC', nombres: 'ASC' } });
  }

  async findOne(id: string) {
    const persona = await this.personaRepository.findOneBy({ id_persona: id });
    if (!persona) {
      throw new NotFoundException(`Persona con id ${id} no encontrada`);
    }
    return persona;
  }

  async update(id: string, updatePersonaDto: UpdatePersonaDto) {
    const persona = await this.findOne(id);
    this.personaRepository.merge(persona, updatePersonaDto);
    try {
      return await this.personaRepository.save(persona);
    } catch (error) {
      manejarErrorBd(error, {
        unico: `Ya existe una persona con identificación ${updatePersonaDto.identificacion}`,
      });
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.personaRepository.delete({ id_persona: id });
    } catch (error) {
      manejarErrorBd(error, { fk: 'No se puede eliminar: la persona tiene un usuario asociado' });
    }
    return { mensaje: 'Persona eliminada', id_persona: id };
  }
}
