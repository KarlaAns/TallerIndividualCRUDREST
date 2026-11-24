import { IsBoolean } from 'class-validator';

// Solo se cambia el estado: false revoca el rol sin borrar el historial de la asignación
export class UpdateUsuarioRolDto {
  @IsBoolean()
  estado: boolean;
}
