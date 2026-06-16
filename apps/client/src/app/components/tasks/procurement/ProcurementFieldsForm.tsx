interface Props {
  toStatus: number;
  fields: Record<string, unknown>;
  onChange: (fields: Record<string, unknown>) => void;
}

export function ProcurementFieldsForm({ toStatus, fields, onChange }: Props) {
  const set = (key: string, value: unknown) => onChange({ ...fields, [key]: value });
  const quotes = (fields['priceQuotes'] as string[]) ?? ['', ''];

  if (toStatus === 2)
    return (
      <div className="flex gap-2">
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Quote 1"
          value={quotes[0]}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-28"
          onChange={(e) => set('priceQuotes', [e.target.value, quotes[1]])}
        />
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Quote 2"
          value={quotes[1]}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-28"
          onChange={(e) => set('priceQuotes', [quotes[0], e.target.value])}
        />
      </div>
    );

  if (toStatus === 3)
    return (
      <input
        placeholder="Receipt"
        value={(fields['receipt'] as string) ?? ''}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        onChange={(e) => set('receipt', e.target.value)}
      />
    );

  return null;
}
