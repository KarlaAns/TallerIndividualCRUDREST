import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity.js';

// Tabla usuario: credenciales de acceso; cada usuario corresponde a una sola persona
@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id_usuario: string;

  @Column({ type: 'uuid', unique: true })
  id_persona: string;

  // FK a persona (Persona 1 : 0..1 Usuario)
  @OneToOne(() => Persona)
  @JoinColumn({ name: 'id_persona', foreignKeyConstraintName: 'fk_usuario_persona' })
  persona: Persona;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  // select: false -> el hash nunca se devuelve en las respuestas
  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;
}
