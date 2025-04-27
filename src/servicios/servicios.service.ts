import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Ajustada la ruta para producción y local
const SERVICIOS_PATH = path.join(__dirname, 'servicios.json');

@Injectable()
export class ServiciosService {
  getPrecios() {
    try {
      const data = fs.readFileSync(SERVICIOS_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      throw new Error('No se pudo leer el archivo de precios');
    }
  }

  updatePrecios(body: any) {
    try {
      fs.writeFileSync(SERVICIOS_PATH, JSON.stringify(body, null, 2), 'utf8');
      return { ok: true };
    } catch (err) {
      throw new Error('No se pudo guardar el archivo de precios');
    }
  }
}