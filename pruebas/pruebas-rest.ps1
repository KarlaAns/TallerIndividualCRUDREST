# ==========================================================================
# Pruebas REST con PowerShell (NestJS debe estar ejecutándose)
# Sistema Bibliotecario · Microservicio 1: Identidad y usuarios
#   powershell -ExecutionPolicy Bypass -File .\pruebas\pruebas-rest.ps1
# ==========================================================================

function Probar-Error([scriptblock]$accion) {
    try {
        & $accion | Out-Null
        Write-Host "No falló (se esperaba un error)" -ForegroundColor Red
    } catch {
        Write-Host "Código HTTP:" ([int]$_.Exception.Response.StatusCode)
        Write-Host "Detalle:" $_.ErrorDetails.Message
    }
}

# ==========================================================================
# PERSONA
# ==========================================================================
Write-Host "`n===== PERSONA =====" -ForegroundColor Cyan
# POST: crear persona
$persona = @{
    nombres = "Ana"
    apellidos = "Perez"
    identificacion = "PRUEBA-001"
    correo = "ana.prueba@example.com"
    telefono = "0991234567"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/persona" -Method Post -ContentType "application/json" -Body $persona

# GET: listar personas
Invoke-RestMethod -Uri "http://localhost:3000/persona" -Method Get | Format-Table

# GET: obtener UUID mediante identificación y consultar persona
$persona = Invoke-RestMethod -Uri "http://localhost:3000/persona" -Method Get
$id = ($persona | Where-Object { $_.identificacion -eq "PRUEBA-001" }).id_persona
$id
Invoke-RestMethod -Uri "http://localhost:3000/persona/$id" -Method Get

# PATCH: actualizar teléfono y comprobar
$datos = @{
    telefono = "0987654321"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/persona/$id" -Method Patch -ContentType "application/json" -Body $datos
Invoke-RestMethod -Uri "http://localhost:3000/persona/$id" -Method Get

# Validación: crear con correo inválido y comprobar HTTP 400
$datos = @{
    nombres = "Carlos"
    apellidos = "Lopez"
    identificacion = "PRUEBA-002"
    correo = "correo-invalido"
} | ConvertTo-Json
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/persona" -Method Post -ContentType "application/json" -Body $datos }

# Identificación repetida: HTTP 409
$datos = @{ nombres = "Ana"; apellidos = "Perez"; identificacion = "PRUEBA-001"; correo = "otra@example.com" } | ConvertTo-Json
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/persona" -Method Post -ContentType "application/json" -Body $datos }

# ==========================================================================
# ROL
# ==========================================================================
Write-Host "`n===== ROL =====" -ForegroundColor Cyan
# GET: listar roles (OPERADOR y CLIENTE vienen de 02_datos_iniciales.sql)
Invoke-RestMethod -Uri "http://localhost:3000/rol" -Method Get | Format-Table

# POST: crear rol
$rol = @{
    nombre = "Bibliotecario"
    descripcion = "Registra préstamos y devoluciones"
} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "http://localhost:3000/rol" -Method Post -ContentType "application/json" -Body $rol
$r
$idRol = $r.id_rol

# PATCH: actualizar descripción y comprobar
$datos = @{ descripcion = "Gestiona préstamos, devoluciones y reservas" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/rol/$idRol" -Method Patch -ContentType "application/json" -Body $datos
Invoke-RestMethod -Uri "http://localhost:3000/rol/$idRol" -Method Get

# Nombre repetido: HTTP 409
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/rol" -Method Post -ContentType "application/json" -Body (@{ nombre = "cliente" } | ConvertTo-Json) }

# ==========================================================================
# USUARIO
# ==========================================================================
Write-Host "`n===== USUARIO =====" -ForegroundColor Cyan
# POST: crear usuario para la persona PRUEBA-001 (la respuesta no trae password_hash)
$usuario = @{
    id_persona = $id
    username = "ana.perez"
    password = "AnaPerez123"
} | ConvertTo-Json
$u = Invoke-RestMethod -Uri "http://localhost:3000/usuario" -Method Post -ContentType "application/json" -Body $usuario
$u
$idUsuario = $u.id_usuario

# GET: listar usuarios
Invoke-RestMethod -Uri "http://localhost:3000/usuario" -Method Get | Format-Table id_usuario, username, estado, fecha_creacion

# PATCH: desactivar usuario y comprobar
$datos = @{ estado = $false } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/usuario/$idUsuario" -Method Patch -ContentType "application/json" -Body $datos
Invoke-RestMethod -Uri "http://localhost:3000/usuario/$idUsuario" -Method Get

# La misma persona no puede tener otro usuario: HTTP 409
$datos = @{ id_persona = $id; username = "ana2"; password = "AnaPerez123" } | ConvertTo-Json
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/usuario" -Method Post -ContentType "application/json" -Body $datos }

# Contraseña de menos de 8 caracteres: HTTP 400
$datos = @{ id_persona = $id; username = "ana3"; password = "123" } | ConvertTo-Json
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/usuario" -Method Post -ContentType "application/json" -Body $datos }

# ==========================================================================
# USUARIO_ROL
# ==========================================================================
Write-Host "`n===== USUARIO_ROL =====" -ForegroundColor Cyan
# POST: asignar rol al usuario
$asignacion = @{
    id_usuario = $idUsuario
    id_rol = $idRol
} | ConvertTo-Json
$ur = Invoke-RestMethod -Uri "http://localhost:3000/usuario-rol" -Method Post -ContentType "application/json" -Body $asignacion
$ur
$idUsuarioRol = $ur.id_usuario_rol

# La misma pareja usuario-rol no se repite (UNIQUE): HTTP 409
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/usuario-rol" -Method Post -ContentType "application/json" -Body $asignacion }

# GET: listar asignaciones
Invoke-RestMethod -Uri "http://localhost:3000/usuario-rol" -Method Get | Format-Table id_usuario_rol, id_usuario, id_rol, estado

# PATCH: revocar el rol (estado = false) y comprobar
$datos = @{ estado = $false } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/usuario-rol/$idUsuarioRol" -Method Patch -ContentType "application/json" -Body $datos

# No se puede eliminar un usuario con roles ni una persona con usuario: HTTP 409
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/usuario/$idUsuario" -Method Delete }
Probar-Error { Invoke-RestMethod -Uri "http://localhost:3000/persona/$id" -Method Delete }

# ==========================================================================
# DELETE en orden inverso y comprobación HTTP 404
# ==========================================================================
Write-Host "`n===== DELETE =====" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:3000/usuario-rol/$idUsuarioRol" -Method Delete
Invoke-RestMethod -Uri "http://localhost:3000/usuario/$idUsuario" -Method Delete
Invoke-RestMethod -Uri "http://localhost:3000/rol/$idRol" -Method Delete

# DELETE: eliminar persona y comprobar HTTP 404
Invoke-RestMethod -Uri "http://localhost:3000/persona/$id" -Method Delete
try {
    Invoke-RestMethod -Uri "http://localhost:3000/persona/$id" -Method Get
} catch {
    Write-Host "Código HTTP:" ([int]$_.Exception.Response.StatusCode)
    Write-Host "Detalle:" $_.ErrorDetails.Message
}
