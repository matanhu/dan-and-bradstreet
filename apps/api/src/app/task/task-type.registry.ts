import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { TaskTypeHandler } from './interfaces/task-type-handler.interface';
import { TASK_TYPE_HANDLERS } from './constants/tokens.constants';

@Injectable()
export class TaskTypeRegistry implements OnModuleInit {
  private readonly handlers = new Map<string, TaskTypeHandler>();

  constructor(
    @Inject(TASK_TYPE_HANDLERS)
    private readonly handlersTypes: TaskTypeHandler[],
  ) {}

  onModuleInit() {
    this.handlersTypes.forEach((h) => this.register(h));
  }

  register(handler: TaskTypeHandler) {
    this.handlers.set(handler.type, handler);
  }

  get(type: string): TaskTypeHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new InternalServerErrorException(
        `No handler registered for task type: ${type}`,
      );
    }
    return handler;
  }

  getAll(): Record<string, number> {
    const result: Record<string, number> = {};
    this.handlers.forEach((handler, type) => {
      result[type] = handler.maxStatus;
    });
    return result;
  }
}
