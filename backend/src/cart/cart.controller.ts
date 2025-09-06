import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from '../dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('patient')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('add')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Patch('update')
  async updateCartItem(@Request() req, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(req.user.userId, updateCartItemDto);
  }

  @Delete('remove')
  async removeFromCart(@Request() req, @Body() removeFromCartDto: RemoveFromCartDto) {
    return this.cartService.removeFromCart(req.user.userId, removeFromCartDto.medicineId);
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Get('validate')
  async validateCart(@Request() req) {
    return this.cartService.validateCartForCheckout(req.user.userId);
  }
}
