import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '../../config/constants';

export default function PieChartCard({ title, data, dataKey = 'value', nameKey = 'name' }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
      {title && <div className="text-sm font-bold text-yellow-400 mb-3">{title}</div>}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={90} strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
