import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

// Valida las altas de usuario; la contraseña llega en texto y se guarda con hash
export class CreateUsuarioDto {
  @IsUUID()
  id_persona: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
