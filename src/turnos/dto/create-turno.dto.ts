import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID, IsDateString, IsIn } from 'class-validator';

export enum DogSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum ServiceType {
  BATH = 'bath',
  BATH_AND_CUT = 'bath and cut',
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

  @ApiProperty({ description: 'Tamaño del perro', enum: DogSize }) 
  @IsEnum(DogSize)
  @IsIn(['small', 'medium', 'large'])
  dogSize: DogSize;

  @ApiProperty({ description: 'Tipo de servicio', enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType: ServiceType;
}