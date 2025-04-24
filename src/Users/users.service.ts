import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UpdateUserDto } from 'src/Users/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient,
  ) {}

  async findAll() {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select('*');
    
    if (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
    
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return data;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar que el usuario existe
    await this.findOne(id);
    
    const { data, error } = await this.supabaseClient
      .from('users')
      .update(updateUserDto)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
    
    return data;
  }

  async remove(id: string) {
    // Verificar que el usuario existe
    await this.findOne(id);
    
    const { error } = await this.supabaseClient
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
    
    return { message: 'Usuario eliminado correctamente' };
  }

  async findByEmail(email: string) {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      return null;
    }
    
    return data;
  }
}