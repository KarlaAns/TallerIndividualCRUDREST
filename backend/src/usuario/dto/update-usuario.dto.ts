import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';

// Valida los cambios: username, password o estado (la persona dueña no se cambia)
export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['id_persona'] as const),
) {}
