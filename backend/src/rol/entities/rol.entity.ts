import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabla rol: catálogo de roles (OPERADOR, CLIENTE)
@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id_rol: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @Column({ type: 'boolean', default: true })
  estado: boolean;
}
