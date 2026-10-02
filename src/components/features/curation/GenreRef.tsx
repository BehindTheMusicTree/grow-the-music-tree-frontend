type Props = { id: string; label?: string; showQid: boolean };

export default function GenreRef({ id, label, showQid }: Props) {
  if (!label) return <span className="font-mono text-sm">{id}</span>;
  return (
    <span className="flex flex-col" title={showQid ? undefined : id}>
      <span>{label}</span>
      {showQid && <span className="font-mono text-xs text-gray-500">{id}</span>}
    </span>
  );
}
