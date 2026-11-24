-- =============================================================
-- Credenciales provisionales de la guía
-- | Rol      | Email               | Contraseña |
-- | Operador | admin@example.com   | Admin12345 |
-- | Cliente  | cliente@example.com | Cliente123 |
-- Las contraseñas se guardan con hash bcrypt (10 rondas), nunca en texto plano.
-- Cargar después de 01_schema.sql:
--   Get-Content database/02_datos_iniciales.sql | docker compose exec -T postgres psql -U biblioteca -d biblioteca_db
-- =============================================================

INSERT INTO rol (nombre, descripcion) VALUES
  ('OPERADOR', 'Administra el catálogo, los préstamos y las cuentas'),
  ('CLIENTE', 'Consulta el catálogo, reserva y solicita préstamos');

INSERT INTO persona (nombres, apellidos, identificacion, correo) VALUES
  ('Operador', 'Biblioteca', 'OPER-001', 'admin@example.com'),
  ('Cliente', 'Biblioteca', 'CLIE-001', 'cliente@example.com');

INSERT INTO usuario (id_persona, username, password_hash)
SELECT id_persona, 'admin@example.com', '$2b$10$sLPKV.2Z6zyKY/h2CYLG1.GAR3AwZFjSWdZ2wOoyuVX5XSX/t77bO'
FROM persona WHERE identificacion = 'OPER-001';

INSERT INTO usuario (id_persona, username, password_hash)
SELECT id_persona, 'cliente@example.com', '$2b$10$H390gmyQyDAafGP7wGqizujrLtJFF0DqRRxxYHyNH81mTGZfPJ8D2'
FROM persona WHERE identificacion = 'CLIE-001';

INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol FROM usuario u, rol r
WHERE u.username = 'admin@example.com' AND r.nombre = 'OPERADOR';

INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol FROM usuario u, rol r
WHERE u.username = 'cliente@example.com' AND r.nombre = 'CLIENTE';
