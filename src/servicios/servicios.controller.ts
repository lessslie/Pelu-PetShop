import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { Roles } from 'src/Auth/decorators/roles.decorator';
import { RolesGuard } from 'src/Auth/guards/roles.guard';

const filePath = path.join(process.cwd(), 'src', 'servicios', 'servicios.json');


@Controller('servicios')
export class ServiciosController {
  @Get()
  getPrecios() {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar precios (solo admin)' })
  @ApiResponse({ status: 200, description: 'Precios actualizados correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Forbidden - No tienes permisos' })
  updatePrecios(@Body() body: number[]) {
    try {
      console.log('Intentando guardar precios en:', filePath);
      fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf8');
      console.log('Precios guardados correctamente.');
      return { ok: true, message: 'Precios guardados correctamente', data: body };
    } catch (err) {
      console.error('Error al guardar precios:', err);
      throw new Error('No se pudo guardar el archivo de precios');
    }
  }
}
