export default function ChatTable({ table }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-line">
      <table className="w-full border-collapse text-left font-mono text-[11px]">
        <thead>
          <tr className="bg-surface2">
            {table.columns.map((col) => (
              <th key={col} className="px-2.5 py-1.5 font-medium uppercase tracking-wide text-text-secondary">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-surface/40" : "bg-transparent"}>
              {row.map((cell, j) => (
                <td key={j} className="px-2.5 py-1.5 text-text-primary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
