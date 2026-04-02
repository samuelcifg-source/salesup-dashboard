export default function Select({ value, onChange, options, className = '', disabled = false }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`bg-black text-yellow-400 border border-neutral-700 rounded-md px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-yellow-500 ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}
