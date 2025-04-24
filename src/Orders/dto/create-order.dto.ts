import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNotEmpty()
  quantity: number;

  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Items del pedido' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}