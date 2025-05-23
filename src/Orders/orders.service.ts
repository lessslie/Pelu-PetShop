import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto, OrderStatus } from './dto/update-order.dto';
import { ProductsService } from 'src/Products/products.service';
import { PaymentService } from 'src/Pagos/payment.service';
import { UsersService } from 'src/Users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabaseClient: SupabaseClient,
    private productsService: ProductsService,
    private paymentService: PaymentService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    // Calcular el total y preparar los items con precios actuales
    let total = 0;
    const items: OrderItemDto[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      const itemTotal = product.price * item.quantity;
      
      items.push({
        ...item,
        price: product.price,
      });
      
      total += itemTotal;
      
      // Actualizar el stock
      await this.productsService.updateStock(item.productId, item.quantity);
    }

    // Crear la orden
    const { data: order, error: orderError } = await this.supabaseClient
      .from('orders')
      .insert({
        user_id: userId,
        total,
        status: OrderStatus.PENDING,
      })
      .select()
      .single();
    
    if (orderError) {
      throw new Error(`Error al crear orden: ${orderError.message}`);
    }

    // Crear los items de la orden
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await this.supabaseClient
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      throw new Error(`Error al crear items de la orden: ${itemsError.message}`);
    }

    // Obtener email del usuario
    const { data: userData, error: userError } = await this.supabaseClient
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      throw new Error('No se pudo obtener el email del usuario para Mercado Pago');
    }

    // Crear preferencia de pago en Mercado Pago
    // Usar los productos reales para armar los items de Mercado Pago
    const mpItems = items.map(item => ({
      name: item.productId && item['productName'] ? item['productName'] : 'Producto',
      price: item.price,
      quantity: item.quantity,
      image: item['image'] || undefined,
    }));
    // Si los productos no tienen 'productName', buscarlo desde la base de datos
    for (let i = 0; i < items.length; i++) {
      if (!mpItems[i].name || mpItems[i].name === 'Producto') {
        // Buscar el producto en la base de datos
        const product = await this.productsService.findOne(items[i].productId);
        mpItems[i].name = product.name;
        mpItems[i].image = product.image || undefined;
      }
    }
    const mpResponse = await this.paymentService.createProductOrderPreference(
      order.id,
      mpItems,
      userData.email
    );

    // Devolver info de la orden y la URL de pago
    return {
      order: await this.findOne(order.id),
      mercadoPagoUrl: mpResponse.init_point,
    };
  }

  async findAll(userId?: string) {
    let query = this.supabaseClient
      .from('orders')
      .select(`
        *,
        order_items(*)
      `);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error al obtener órdenes: ${error.message}`);
    }
    
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseClient
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }
    
    return data;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    // Verificar que la orden existe
    await this.findOne(id);
    
    const { data, error } = await this.supabaseClient
      .from('orders')
      .update(updateOrderDto)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al actualizar orden: ${error.message}`);
    }
    
    return data;
  }

  async remove(id: string) {
    // Verificar que la orden existe
    await this.findOne(id);
    
    // Primero eliminamos los items de la orden
    const { error: itemsError } = await this.supabaseClient
      .from('order_items')
      .delete()
      .eq('order_id', id);
    
    if (itemsError) {
      throw new Error(`Error al eliminar items de la orden: ${itemsError.message}`);
    }
    
    // Luego eliminamos la orden
    const { error } = await this.supabaseClient
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al eliminar orden: ${error.message}`);
    }
    
    return { message: 'Orden eliminada correctamente' };
  }
}