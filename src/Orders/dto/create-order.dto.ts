import { IsArray, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Precio del producto' })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Imagen del producto' })
  @IsNotEmpty()
  image: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Items del pedido' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}