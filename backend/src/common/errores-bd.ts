import { ConflictException } from '@nestjs/common';

/**
 * Convierte los errores de PostgreSQL en respuestas HTTP claras.
 * 23505 = violación de UNIQUE, 23503 = violación de FOREIGN KEY.
 */
export function manejarErrorBd(
  error: unknown,
  mensajes: { unico?: string; fk?: string } = {},
): never {
  const e = error as { code?: string; driverError?: { code?: string } };
  const codigo = e?.driverError?.code ?? e?.code;
  if (codigo === '23505') {
    throw new ConflictException(mensajes.unico ?? 'El registro ya existe');
  }
  if (codigo === '23503') {
    throw new ConflictException(mensajes.fk ?? 'El registro está referenciado por otros datos');
  }
  throw error;
}
