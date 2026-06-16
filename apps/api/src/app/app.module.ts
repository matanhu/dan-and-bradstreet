import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { DataAccessModule } from '@org/data-access';

@Module({
  imports: [TaskModule, DataAccessModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
