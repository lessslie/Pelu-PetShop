import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProductDto, ProductCategory } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { data, error } = await this.supabaseClient
      .from('products')
      .insert(createProductDto)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
    
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseClient
      .from('products')
      .select('*');
    
    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
    
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseClient
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    
    return data;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Verificar que el producto existe
    await this.findOne(id);
    
    const { data, error } = await this.supabaseClient
      .from('products')
      .update(updateProductDto)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
    
    return data;
  }

  async remove(id: string) {
    // Verificar que el producto existe
    await this.findOne(id);
    
    const { error } = await this.supabaseClient
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
    
    return { message: 'Producto eliminado correctamente' };
  }

  async findByCategory(category: ProductCategory) {
    const { data, error } = await this.supabaseClient
      .from('products')
      .select('*')
      .eq('category', category);
    
    if (error) {
      throw new Error(`Error al obtener productos por categoría: ${error.message}`);
    }
    
    return data;
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.findOne(id);
    
    if (product.stock < quantity) {
      throw new Error('No hay suficiente stock disponible');
    }
    
    const { data, error } = await this.supabaseClient
      .from('products')
      .update({ stock: product.stock - quantity })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
    
    return data;
  }

  
}