import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity.js';
import { Rol } from '../../rol/entities/rol.entity.js';

// Tabla usuario_rol: resuelve la N:M usuario-rol sin repetir la misma pareja
@Entity('usuario_rol')
@Unique('uq_usuario_rol', ['id_usuario', 'id_rol'])
export class UsuarioRol {
  @PrimaryGeneratedColumn('uuid')
  id_usuario_rol: string;

  @Column({ type: 'uuid' })
  id_usuario: string;

  @Column({ type: 'uuid' })
  id_rol: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario', foreignKeyConstraintName: 'fk_usuario_rol_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'id_rol', foreignKeyConstraintName: 'fk_usuario_rol_rol' })
  rol: Rol;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_asignacion: Date;

  @Column({ type: 'boolean', default: true })
  estado: boolean;
}
