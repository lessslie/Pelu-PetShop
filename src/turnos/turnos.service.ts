import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateTurnoDto, DogSize, ServiceType } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { MailService } from '../Mails/mail.service';

export interface Turno {
  id: string;
  userId: string;
  dogName: string;
  date: string;
  time: string;
  dogSize: DogSize;
  serviceType: ServiceType;
}

@Injectable()
export class TurnosService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient,
    private mailService: MailService,
  ) {}

  async createTurno(dto: CreateTurnoDto): Promise<Turno> {
    // Validar que la fecha sea un día laborable (lunes a viernes)
    const date = new Date(dto.date);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = domingo, 6 = sábado
      throw new BadRequestException('Solo se pueden agendar turnos de lunes a viernes');
    }
    
    // Validar que la hora esté dentro del horario permitido (8:00 a 18:00)
    const [hours, minutes] = dto.time.split(':').map(Number);
    
    if (hours < 8 || hours > 18 || (hours === 18 && minutes > 0)) {
      throw new BadRequestException('El horario de atención es de 8:00 a 18:00');
    }
    
    // Validar que el horario sea un slot válido (cada 1:30 horas)
    const validMinutes = [0, 30]; // Slots que comienzan a la hora en punto o a la media hora
    
    if (!validMinutes.includes(minutes)) {
      throw new BadRequestException('Los turnos deben comenzar a la hora en punto o a la media hora');
    }
    
    // Verificar que el turno no se superponga con otros turnos existentes
    // Cada turno dura 1:30 horas
    const turnoStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Calcular la hora de finalización (agregar 1:30 horas)
    const endTimeDate = new Date(date);
    endTimeDate.setHours(hours);
    endTimeDate.setMinutes(minutes + 90); // 1:30 horas = 90 minutos
    
    const endHour = endTimeDate.getHours();
    const endMinute = endTimeDate.getMinutes();
    const turnoEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // Verificar que el turno no exceda el horario de atención
    if (endHour > 18 || (endHour === 18 && endMinute > 0)) {
      throw new BadRequestException('El turno excede el horario de atención (hasta las 18:00)');
    }
    
    // Verificar que no exista otro turno para la misma fecha y hora
    const { data: existingTurnos, error: queryError } = await this.supabaseClient
      .from('turnos')
      .select('*')
      .eq('date', dto.date)
      .or(`time.eq.${turnoStartTime},time.eq.${hours.toString().padStart(2, '0')}:00,time.eq.${hours.toString().padStart(2, '0')}:30`);
    
    if (queryError) {
      console.error('Error al verificar disponibilidad:', queryError);
      throw new Error(`Error al verificar disponibilidad: ${queryError.message}`);
    }
    
    if (existingTurnos && existingTurnos.length > 0) {
      throw new BadRequestException('Ya existe un turno para esta fecha y hora');
    }
    
    // Si pasó todas las validaciones, crear el turno
    // Convertir dog_size y service_type a mayúsculas para cumplir con la restricción de la base de datos
    const { data, error } = await this.supabaseClient
      .from('turnos')
      .insert({
        user_id: dto.userId,
        dog_name: dto.dogName,
        date: dto.date,
        time: dto.time,
        dog_size: dto.dogSize.toUpperCase(), // Convertir a mayúsculas
        service_type: dto.serviceType === 'bath' ? 'BATH' : 'BATH_AND_CUT' // Convertir a mayúsculas
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error al crear turno:', error);
      throw new Error(`Error al crear turno: ${error.message}`);
    }

    // Obtener información del usuario para el correo
    const { data: userData, error: userError } = await this.supabaseClient
      .from('users')
      .select('email, "firstName", "lastName"')
      .eq('id', dto.userId)
      .single();

    if (!userError && userData) {
      try {
        // Enviar correo de confirmación
        await this.mailService.sendAppointmentConfirmation(
          userData.email,
          `${userData.firstName} ${userData.lastName}`,
          dto.dogName,
          dto.date,
          dto.time,
          dto.dogSize,
          dto.serviceType
        );
      } catch (emailError) {
        console.error('Error al enviar correo de confirmación:', emailError);
        // No interrumpimos el flujo si falla el envío del correo
      }
    }
    
    // Convertir el resultado de snake_case a camelCase
    return {
      id: data.id,
      userId: data.user_id,
      dogName: data.dog_name,
      date: data.date,
      time: data.time,
      dogSize: data.dog_size.toLowerCase() as DogSize, // Convertir a minúsculas para la respuesta
      
      serviceType: data.service_type === 'BATH' ? ServiceType.BATH : ServiceType.BATH_AND_CUT
    };
  }

  async getTurnosByUser(userId: string): Promise<Turno[]> {
    const { data, error } = await this.supabaseClient
      .from('turnos')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al obtener turnos:', error);
      throw new Error(`Error al obtener turnos: ${error.message}`);
    }
    
    // Convertir todos los resultados de snake_case a camelCase
    return data.map(turno => ({
      id: turno.id,
      userId: turno.user_id,
      dogName: turno.dog_name,
      date: turno.date,
      time: turno.time,
      dogSize: turno.dog_size.toLowerCase() as DogSize, // Convertir a minúsculas
      serviceType: turno.service_type === 'BATH' ? ServiceType.BATH : ServiceType.BATH_AND_CUT // Convertir a minúsculas
    }));
  }

  async getAllTurnos(): Promise<Turno[]> {
    const { data, error } = await this.supabaseClient
      .from('turnos')
      .select('*');
    if (error) {
      console.error('Error al obtener todos los turnos:', error);
      throw new Error(`Error al obtener turnos: ${error.message}`);
    }
    return data.map(turno => ({
      id: turno.id,
      userId: turno.user_id,
      dogName: turno.dog_name,
      date: turno.date,
      time: turno.time,
      dogSize: turno.dog_size.toLowerCase() as DogSize, // Convertir a minúsculas
      serviceType: turno.service_type === 'BATH' ? ServiceType.BATH : ServiceType.BATH_AND_CUT // Convertir a minúsculas
    }));
  }

  async updateTurno(id: string, dto: UpdateTurnoDto): Promise<Turno | null> {
    // Primero verificamos si el turno existe
    const { data: existingTurno, error: findError } = await this.supabaseClient
      .from('turnos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError || !existingTurno) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }
    
    // Preparar datos para actualizar (convertir de camelCase a snake_case)
    const updateData: any = {};
    if (dto.userId) updateData.user_id = dto.userId;
    if (dto.dogName) updateData.dog_name = dto.dogName;
    if (dto.date) updateData.date = dto.date;
    if (dto.time) updateData.time = dto.time;
    if (dto.dogSize) updateData.dog_size = dto.dogSize.toUpperCase(); // Convertir a mayúsculas
    if (dto.serviceType) updateData.service_type = dto.serviceType === 'bath' ? 'BATH' : 'BATH_AND_CUT'; // Convertir a mayúsculas
    
    // Actualizar el turno
    const { data, error } = await this.supabaseClient
      .from('turnos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error al actualizar turno:', error);
      throw new Error(`Error al actualizar turno: ${error.message}`);
    }
    
    // Convertir el resultado de snake_case a camelCase
    return {
      id: data.id,
      userId: data.user_id,
      dogName: data.dog_name,
      date: data.date,
      time: data.time,
      dogSize: data.dog_size.toLowerCase() as DogSize, // Convertir a minúsculas
      serviceType: data.service_type === 'BATH' ? ServiceType.BATH : ServiceType.BATH_AND_CUT 
    };
  }

  async deleteTurno(id: string): Promise<boolean> {
    // Primero verificamos si el turno existe
    const { data: existingTurno, error: findError } = await this.supabaseClient
      .from('turnos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError || !existingTurno) {
      return false; // No existe el turno
    }
    
    // Eliminar el turno
    const { error } = await this.supabaseClient
      .from('turnos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error al eliminar turno:', error);
      throw new Error(`Error al eliminar turno: ${error.message}`);
    }
    
    return true;
  }
  // Añadir este método a TurnosService
async getAvailableTimeSlots(date: string): Promise<string[]> {
  // Validar que la fecha sea un día laborable (lunes a viernes)
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = domingo, 6 = sábado
    return []; // No hay horarios disponibles en fin de semana
  }
  
  // Generar todos los slots posibles (cada 1:30 horas desde 8:00 hasta 18:00)

  const allSlots: string[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour !== 17) { // No incluir 17:30 porque el turno terminaría a las 19:00
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  
  // Obtener turnos existentes para esa fecha
  const { data: existingTurnos, error } = await this.supabaseClient
    .from('turnos')
    .select('time')
    .eq('date', date);
  
  if (error) {
    console.error('Error al obtener turnos:', error);
    throw new Error(`Error al obtener turnos: ${error.message}`);
  }
  
  // Eliminar slots que ya están ocupados
  // Cada turno ocupa su slot inicial más los dos slots siguientes (1:30 horas = 3 slots de 30 min)
  const occupiedSlots = new Set();
  
  existingTurnos.forEach(turno => {
    const [hour, minute] = turno.time.split(':').map(Number);
    
    // Marcar el slot inicial como ocupado
    occupiedSlots.add(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    
    // Marcar los dos slots siguientes como ocupados
    let nextHour = hour;
    let nextMinute = minute + 30;
    
    if (nextMinute >= 60) {
      nextHour += 1;
      nextMinute -= 60;
    }
    
    occupiedSlots.add(`${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`);
    
    nextMinute += 30;
    if (nextMinute >= 60) {
      nextHour += 1;
      nextMinute -= 60;
    }
    
    occupiedSlots.add(`${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`);
  });
  
  // Filtrar los slots disponibles
  const availableSlots = allSlots.filter(slot => !occupiedSlots.has(slot));
  
  return availableSlots;
}
}