import { Controller, Get, Put, Body } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const SERVICIOS_PATH = path.join(process.cwd(), 'servicios.json');

@Controller('servicios')
export class ServiciosController {
  @Get()
  getPrecios() {
    const raw = fs.readFileSync(SERVICIOS_PATH, 'utf8');
    return JSON.parse(raw);
  }

  @Put()
  updatePrecios(@Body() body: any) {
    try {
      console.log('Intentando guardar precios en:', SERVICIOS_PATH);
      fs.writeFileSync(SERVICIOS_PATH, JSON.stringify(body, null, 2), 'utf8');
      console.log('Precios guardados correctamente.');
      return { ok: true };
    } catch (err) {
      console.error('Error al guardar precios:', err);
      throw new Error('No se pudo guardar el archivo de precios');
    }
  }
}
