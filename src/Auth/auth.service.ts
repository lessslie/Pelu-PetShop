import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CustomJwtPayload } from './interfaces/jwt-payload.interface';
@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const { email, password, firstName, lastName, phone, petName } = registerDto;

    // Verificar si el usuario ya existe
    const { data: existingUser } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario en Supabase
    const { data: newUser, error } = await this.supabaseClient
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        pet_name: petName,
        role: 'client', // Por defecto, todos son clientes
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    // Generar token JWT
    const payload: CustomJwtPayload = { 
      userId: newUser.id, 
      email: newUser.email,
      role: newUser.role 
    };
    
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const { data: user, error } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload: CustomJwtPayload = { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    };
    
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async validateUser(payload: CustomJwtPayload): Promise<any> {
    const { data: user } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();
      
    return user;
  }
}