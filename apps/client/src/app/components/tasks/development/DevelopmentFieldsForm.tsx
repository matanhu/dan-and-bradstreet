interface Props {
  toStatus: number;
  fields: Record<string, unknown>;
  onChange: (fields: Record<string, unknown>) => void;
}

export function DevelopmentFieldsForm({ toStatus, fields, onChange }: Props) {
  const set = (key: string, value: unknown) => onChange({ ...fields, [key]: value });

  if (toStatus === 2)
    return (
      <input
        placeholder="Specification"
        value={(fields['specification'] as string) ?? ''}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        onChange={(e) => set('specification', e.target.value)}
      />
    );

  if (toStatus === 3)
    return (
      <input
        placeholder="Branch name"
        value={(fields['branchName'] as string) ?? ''}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        onChange={(e) => set('branchName', e.target.value)}
      />
    );

  if (toStatus === 4)
    return (
      <input
        placeholder="Version (e.g. 1.0.0)"
        value={(fields['version'] as string) ?? ''}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-36"
        onChange={(e) => set('version', e.target.value)}
      />
    );

  return null;
}
