import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CustomJwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string , userId: string, email: string, role: string, firstName: string, lastName: string, phone: string, petName: string}> {
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
        firstName,
        lastName,
        phone,
        petName,
        role: 'client', // Por defecto, todos son clientes
      })
      .select()
      .single();

    if (error) {
      throw new ConflictException(`Error al crear usuario: ${error.message}`);
    }

    // Generar token JWT
    const payload: CustomJwtPayload = { 
      userId: newUser.id, 
      email: newUser.email,
      role: newUser.role 
    };
    
    const token = this.jwtService.sign(payload);

    return { access_token: token , userId: newUser.id, email: newUser.email, role: newUser.role, firstName: newUser.firstName, lastName: newUser.lastName, phone: newUser.phone, petName: newUser.petName};
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
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

    return { access_token: token };
  }

  async validateUser(payload: CustomJwtPayload): Promise<User> {
    const { data: user } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();
      
    return user;
  }
}