import { IsNotEmpty, IsNumber, IsString, IsEnum, Min, IsUrl, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductCategory {
  DOG_FOOD = 'dog_food',
  CAT_FOOD = 'cat_food',
  DOG_ACCESSORIES = 'dog_accessories',
  CAT_ACCESSORIES = 'cat_accessories',
  DOG_TOYS = 'dog_toys',
  CAT_TOYS = 'cat_toys',
  DOG_CLOTHES = 'dog_clothes',
  CAT_CLOTHES = 'cat_clothes',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Dog Food', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Alimento premium para perros adultos', description: 'Descripción del producto' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 45.99, description: 'Precio del producto' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Cantidad en stock' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ 
    enum: ProductCategory, 
    example: ProductCategory.DOG_FOOD, 
    description: 'Categoría del producto' 
  })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ example: 'https://ejemplo.com/imagen.jpg', description: 'URL de la imagen principal' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ 
    type: [String],
    example: ['https://ejemplo.com/imagen1.jpg', 'https://ejemplo.com/imagen2.jpg'], 
    description: 'URLs de imágenes adicionales' 
  })
  @IsArray()
  @IsOptional()
  images?: string[];
}