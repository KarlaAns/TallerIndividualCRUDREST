import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { UsuarioRolService } from './usuario-rol.service.js';
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto.js';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto.js';

// Rutas HTTP de usuario_rol
@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly usuarioRolService: UsuarioRolService) {}

  @Post()
  create(@Body() createUsuarioRolDto: CreateUsuarioRolDto) {
    return this.usuarioRolService.create(createUsuarioRolDto);
  }

  @Get()
  findAll() {
    return this.usuarioRolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioRolService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUsuarioRolDto: UpdateUsuarioRolDto) {
    return this.usuarioRolService.update(id, updateUsuarioRolDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioRolService.remove(id);
  }
}
