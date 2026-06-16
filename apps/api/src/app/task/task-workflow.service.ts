import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, Task, TaskType } from '@org/data-access';
import { TaskTypeRegistry } from './task-type.registry';
import { TASK_ERRORS } from './constants/errors.constants';

@Injectable()
export class TaskWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: TaskTypeRegistry,
  ) {}

  async createTask(type: TaskType, assignedTo: number): Promise<Task> {
    await this.assertUserExists(assignedTo);
    return this.prisma.task.create({ data: { type, assignedTo } });
  }

  async changeStatus(
    taskId: number,
    toStatus: number,
    nextAssignedTo: number,
    customFields: Record<string, unknown>,
  ): Promise<Task> {
    // Validate inputs that don't require DB state first
    if (toStatus < 1) {
      throw new BadRequestException(TASK_ERRORS.STATUS_MUST_BE_POSITIVE);
    }

    await this.assertUserExists(nextAssignedTo);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Read inside the transaction so fromStatus, validations, and write are all consistent
        const task = await tx.task.findUnique({ where: { id: taskId } });
        if (!task) {
          throw new NotFoundException(`Task ${taskId} not found`);
        }

        if (task.isClosed) {
          throw new BadRequestException(TASK_ERRORS.TASK_ALREADY_CLOSED);
        }

        const handler = this.registry.get(task.type);
        const from = task.status;

        // Rule 4: forward moves must be sequential (one step at a time)
        if (toStatus > from && toStatus !== from + 1) {
          throw new BadRequestException(
            TASK_ERRORS.FORWARD_MOVES_MUST_BE_SEQUENTIAL,
          );
        }

        // Rule 5: backward moves are always allowed (no sequential restriction)

        // Rule 7a: type-specific field validation on forward moves
        if (toStatus > from) {
          handler.validateStatusChange(toStatus, customFields);
        }

        // Merge incoming fields onto existing; on backward moves also strip
        // fields from statuses above toStatus so the next forward pass is clean
        const merged = {
          ...(task.customFields as Record<string, unknown>),
          ...customFields,
        };
        if (toStatus < from) {
          for (let s = toStatus + 1; s <= handler.maxStatus; s++) {
            for (const field of handler.getFieldsForStatus(s)) {
              delete merged[field];
            }
          }
        }

        await tx.taskHistory.create({
          data: {
            taskId,
            fromStatus: from,
            toStatus,
            assignedTo: nextAssignedTo,
            customFields: customFields as object,
          },
        });

        return tx.task.update({
          where: { id: taskId, updatedAt: task.updatedAt },
          data: {
            status: toStatus,
            assignedTo: nextAssignedTo,
            customFields: merged as object,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if ((error as { code?: string }).code === 'P2025') {
        throw new ConflictException(TASK_ERRORS.TASK_MODIFIED_CONCURRENTLY);
      }
      throw new InternalServerErrorException(
        TASK_ERRORS.FAILED_UPDATE_TASK_STATUS,
      );
    }
  }

  async closeTask(taskId: number): Promise<Task> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException(`Task ${taskId} not found`);

        if (task.isClosed) {
          throw new BadRequestException(TASK_ERRORS.TASK_ALREADY_CLOSED);
        }

        const handler = this.registry.get(task.type);

        if (task.status !== handler.maxStatus)
          throw new BadRequestException(
            TASK_ERRORS.TASK_MUST_BE_AT_FINAL_STATUS(handler.maxStatus),
          );

        await tx.taskHistory.create({
          data: {
            taskId,
            fromStatus: task.status,
            toStatus: task.status,
            assignedTo: task.assignedTo,
            customFields: {},
          },
        });

        return tx.task.update({
          where: { id: taskId, updatedAt: task.updatedAt },
          data: { isClosed: true },
        });
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if ((error as { code?: string }).code === 'P2025') {
        throw new ConflictException(TASK_ERRORS.TASK_MODIFIED_CONCURRENTLY);
      }
      throw new InternalServerErrorException(
        TASK_ERRORS.FAILED_UPDATE_TASK_STATUS,
      );
    }
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { assignedTo: userId },
      include: { history: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  getRegisteredTypesConfig(): Record<string, number> {
    return this.registry.getAll();
  }

  private async assertUserExists(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Invalid user');
    }
  }
}
