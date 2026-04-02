import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '../../config/constants';

export default function BarChartCard({ title, data, dataKey, nameKey = 'name', color, bars }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
      {title && <div className="text-sm font-bold text-yellow-400 mb-3">{title}</div>}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={nameKey} tick={{ fill: '#999', fontSize: 11 }} />
          <YAxis tick={{ fill: '#999', fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {bars ? bars.map((b, i) => (
            <Bar key={b.dataKey} dataKey={b.dataKey} fill={b.color || CHART_COLORS[i]} name={b.name || b.dataKey} radius={[4, 4, 0, 0]} />
          )) : (
            <Bar dataKey={dataKey} fill={color || CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
