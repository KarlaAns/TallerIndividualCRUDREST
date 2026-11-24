import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

// Valida la asignación de un rol a un usuario
export class CreateUsuarioRolDto {
  @IsUUID()
  id_usuario: string;

  @IsUUID()
  id_rol: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
