import { BadRequestException, Injectable } from '@nestjs/common';
import { TaskTypeHandler } from '../interfaces/task-type-handler.interface';

@Injectable()
export class DevelopmentHandler implements TaskTypeHandler {
  readonly type = 'DEVELOPMENT';
  readonly maxStatus = 4;

  validateStatusChange(
    toStatus: number,
    customFields: Record<string, unknown>,
  ) {
    if (toStatus === 2) {
      if (!String(customFields['specification'] ?? '').trim())
        throw new BadRequestException('Status 2 requires non-empty specification text');
    }
    if (toStatus === 3) {
      if (!String(customFields['branchName'] ?? '').trim())
        throw new BadRequestException('Status 3 requires a non-empty branch name');
    }
    if (toStatus === 4) {
      const version = String(customFields['version'] ?? '').trim();
      if (!version || !/^\d+\.\d+\.\d+$/.test(version))
        throw new BadRequestException(
          'Status 4 requires a valid semver version (e.g. 1.0.0)',
        );
    }
  }

  getFieldsForStatus(status: number): string[] {
    if (status === 2) return ['specification'];
    if (status === 3) return ['branchName'];
    if (status === 4) return ['version'];
    return [];
  }
}
