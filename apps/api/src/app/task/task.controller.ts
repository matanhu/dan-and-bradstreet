import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TaskWorkflowService } from './task-workflow.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly workflow: TaskWorkflowService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.workflow.createTask(dto.type, dto.assignedTo);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.workflow.changeStatus(
      id,
      dto.toStatus,
      dto.nextAssignedTo,
      dto.customFields,
    );
  }

  @Post(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.workflow.closeTask(id);
  }

  @Get('config')
  getConfig() {
    return this.workflow.getRegisteredTypesConfig();
  }

  @Get('user/:userId')
  getUserTasks(@Param('userId', ParseIntPipe) userId: number) {
    return this.workflow.getUserTasks(userId);
  }
}
