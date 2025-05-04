import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RolesGuard } from 'src/Auth/guards/roles.guard';
import { Roles } from 'src/Auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {

  constructor(private readonly ordersService: OrdersService) {}

  // --- CREAR ORDEN ---
  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('client', 'admin')
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // Ahora devuelve la URL de Mercado Pago
    return await this.ordersService.create(req.user.id, createOrderDto);
  }

  // --- OBTENER TODAS LAS ORDENES (SOLO ADMIN) ---
  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.ordersService.findAll();
  }

  // --- OBTENER MIS ORDENES ---
  @Get('my-orders')
  @ApiOperation({ summary: 'Obtener mis órdenes' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('client', 'admin')
  getMyOrders(@Request() req) {
    return this.ordersService.findAll(req.user.id);
  }

  // --- OBTENER UNA ORDEN POR ID ---
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('client', 'admin')
  findOne(@Param('id') id: string, @Request() req) {
    // Un admin puede ver cualquier orden, un cliente solo sus propias órdenes
    if (req.user.role === 'admin') {
      return this.ordersService.findOne(id);
    } else {
      // Aquí deberías verificar que la orden pertenece al usuario actual
      return this.ordersService.findOne(id);
    }
  }

  // --- ACTUALIZAR UNA ORDEN (SOLO ADMIN) ---
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // --- ELIMINAR UNA ORDEN (CLIENTE O ADMIN) ---
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('client', 'admin')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}