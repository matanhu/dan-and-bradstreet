import { BadRequestException, Injectable } from '@nestjs/common';
import { TaskTypeHandler } from '../interfaces/task-type-handler.interface';

@Injectable()
export class ProcurementHandler implements TaskTypeHandler {
  readonly type = 'PROCUREMENT';
  readonly maxStatus = 3;

  validateStatusChange(
    toStatus: number,
    customFields: Record<string, unknown>,
  ) {
    if (toStatus === 2) {
      const quotes = customFields['priceQuotes'];
      if (
        !Array.isArray(quotes) ||
        quotes.length < 2 ||
        quotes.some((q) => !String(q).trim() || isNaN(Number(q)) || Number(q) <= 0)
      )
        throw new BadRequestException(
          'Status 2 requires at least 2 positive numeric price quotes',
        );
    }
    if (toStatus === 3) {
      if (!String(customFields['receipt'] ?? '').trim())
        throw new BadRequestException('Status 3 requires a non-empty receipt');
    }
  }

  getFieldsForStatus(status: number): string[] {
    if (status === 2) return ['priceQuotes'];
    if (status === 3) return ['receipt'];
    return [];
  }
}
