import { Module } from '@nestjs/common';
import { UsersService } from 'src/Users/users.service';
import { UsersController } from 'src/Users/users.controller';
import { SupabaseProvider } from 'src/config/supabase.config';

@Module({
  providers: [UsersService, SupabaseProvider],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}