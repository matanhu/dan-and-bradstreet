import { Module } from '@nestjs/common';
import { DataAccessModule } from '@org/data-access';
import { TaskTypeRegistry } from './task-type.registry';
import { ProcurementHandler } from './handlers/procurement.handler';
import { DevelopmentHandler } from './handlers/development.handler';
import { TASK_TYPE_HANDLERS } from './constants/tokens.constants';
import { TaskController } from './task.controller';
import { TaskWorkflowService } from './task-workflow.service';

const HANDLERS = [ProcurementHandler, DevelopmentHandler];

@Module({
  controllers: [TaskController],
  imports: [DataAccessModule],
  providers: [
    TaskWorkflowService,
    TaskTypeRegistry,
    ...HANDLERS,
    {
      provide: TASK_TYPE_HANDLERS,
      useFactory: (...instances: InstanceType<typeof HANDLERS[number]>[]) =>
        instances,
      inject: HANDLERS,
    },
  ],
  exports: [TaskTypeRegistry],
})
export class TaskModule {}
