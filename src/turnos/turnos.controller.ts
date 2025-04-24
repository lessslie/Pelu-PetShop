import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { TurnosService, Turno } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { ApiProperty } from '@nestjs/swagger';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post('appointment')
  @ApiProperty({
    description: 'agendar un turno',
    example: {
      id: '1',
      userId: '1',
      dogName: 'Rex',
      date: '2023-01-01',
      time: '08:00',
      dogSize: 'small',
      serviceType: 'bath'
    }
  })
  async createTurno(
    @Body() dto: CreateTurnoDto,
  ): Promise<Turno> {
    return this.turnosService.createTurno(dto);
  }


  @Get()
  @ApiProperty({
    description: 'mostrar todos los turnos',
    })
  async getAllTurnos(): Promise<Turno[]> {
    return this.turnosService.getAllTurnos();
  }

@Get('available-slots/:date')
@ApiProperty({
  description: 'mostrar los slots disponibles para un día',
  type: [String],
  example: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']
})
async getAvailableTimeSlots(@Param('date') date: string): Promise<string[]> {
  return this.turnosService.getAvailableTimeSlots(date);
}
  
  @Get('appointments/:userId')
  @ApiProperty({
    description: 'mostrar los turnos de un usuario',
    example: [
      {
        id: '1',
        userId: '1',
        dogName: 'Rex',
        date: '2023-01-01',
        time: '08:00',
        dogSize: 'small',
        serviceType: 'bath'
      },
      {
        id: '2',
        userId: '2',
        dogName: 'Luna',
        date: '2023-01-01',
        time: '08:30',
        dogSize: 'medium',
        serviceType: 'grooming'
      }
    ]
  })
  async getTurnosByUser(
    @Param('userId') userId: string,
  ): Promise<Turno[]> {
    return this.turnosService.getTurnosByUser(userId);
  }

 

  @Put(':id')
  @ApiProperty({
    description: 'actualizar un turno',
  })
  async updateTurno(
    @Param('id') id: string,
    @Body() dto: UpdateTurnoDto,
  ): Promise<Turno | null> {
    return this.turnosService.updateTurno(id, dto);
  }

  @Delete(':id')
  @ApiProperty({
    description: 'eliminar un turno',
  })
  async deleteTurno(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const success = await this.turnosService.deleteTurno(id);
    return { success };
  }
}
