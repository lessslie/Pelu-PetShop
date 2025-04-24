import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum OrderStatus {

  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateOrderDto {
  @ApiProperty({ description: 'Estado del pedido' })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}