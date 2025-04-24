import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID, IsDateString } from 'class-validator';

export enum DogSize {
  SMALL = 'pequeño',
  MEDIUM = 'mediano',
  LARGE = 'grande',
}

export enum ServiceType {
  BATH = 'baño',
  BATH_AND_CUT = 'baño y corte',
}

export class CreateTurnoDto {
  @ApiProperty({ description: 'ID del usuario' }  )
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Nombre del perro' })
  @IsString()
  @IsNotEmpty()
  dogName: string;

  @ApiProperty({ description: 'Fecha del turno' })  
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Hora del turno' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: 'Tamaño del perro' }) 
  @IsEnum(DogSize)
  dogSize: DogSize;

  @ApiProperty({ description: 'Tipo de servicio' })
  @IsEnum(ServiceType)
  serviceType: ServiceType;
}
