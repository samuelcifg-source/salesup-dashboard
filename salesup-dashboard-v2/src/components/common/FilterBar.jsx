import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import Select from './Select';
import { PERIODS } from '../../config/constants';

registerLocale('es', es);

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const dpClass = "bg-black text-white border border-neutral-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500 w-28 cursor-pointer";
const dpClassOrange = "bg-black text-white border border-neutral-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400 w-28 cursor-pointer";

export default function FilterBar({ title, grouping, setGrouping, groupOptions, period, setPeriod, customDates, setCustomDates, comparisonOn, setComparisonOn, compareDates, setCompareDates, extraFilters, periodDisabled }) {
  const isCustom = period === 'CUSTOM';

  return (
    <div className="bg-black rounded-xl border border-neutral-800 overflow-hidden mb-4">
      <div className="bg-teal-700 px-4 py-2 flex items-center justify-between">
        <span className="text-white font-bold text-sm">{title}</span>
      </div>
      <div className="flex flex-wrap items-end gap-4 px-4 py-2 border-b border-neutral-800 bg-teal-900/20">
        {groupOptions && (
          <div>
            <div className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest mb-1">Agrupar</div>
            <Select value={grouping} onChange={setGrouping} options={groupOptions.map(g => ({ label: g, value: g }))} />
          </div>
        )}
        <div>
          <div className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest mb-1">Periodo</div>
          <Select value={period} onChange={setPeriod} options={PERIODS} disabled={periodDisabled} />
        </div>
        {isCustom && (
          <>
            <div>
              <div className="text-[9px] text-teal-300 font-bold uppercase tracking-widest mb-1">Desde</div>
              <DatePicker
                selected={parseDate(customDates.s1)}
                onChange={d => setCustomDates(p => ({ ...p, s1: formatDate(d) }))}
                dateFormat="dd/MM/yyyy"
                locale="es"
                className={dpClass}
                calendarClassName="dark-calendar"
                popperPlacement="bottom-start"
              />
            </div>
            <div>
              <div className="text-[9px] text-teal-300 font-bold uppercase tracking-widest mb-1">Hasta</div>
              <DatePicker
                selected={parseDate(customDates.e1)}
                onChange={d => setCustomDates(p => ({ ...p, e1: formatDate(d) }))}
                dateFormat="dd/MM/yyyy"
                locale="es"
                className={dpClass}
                calendarClassName="dark-calendar"
                popperPlacement="bottom-start"
              />
            </div>
          </>
        )}
        {setComparisonOn && (
          <div className="flex items-center gap-2 pb-1">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={comparisonOn} onChange={e => setComparisonOn(e.target.checked)} className="accent-yellow-400 w-3.5 h-3.5 cursor-pointer" />
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Comparar</span>
            </label>
          </div>
        )}
        {comparisonOn && compareDates && setCompareDates && (
          <>
            <div>
              <div className="text-[9px] text-orange-400 font-bold uppercase tracking-widest mb-1">Comparar Desde</div>
              <DatePicker
                selected={parseDate(compareDates.start)}
                onChange={d => setCompareDates(p => ({ ...p, start: formatDate(d) }))}
                dateFormat="dd/MM/yyyy"
                locale="es"
                className={dpClassOrange}
                calendarClassName="dark-calendar"
                popperPlacement="bottom-start"
              />
            </div>
            <div>
              <div className="text-[9px] text-orange-400 font-bold uppercase tracking-widest mb-1">Comparar Hasta</div>
              <DatePicker
                selected={parseDate(compareDates.end)}
                onChange={d => setCompareDates(p => ({ ...p, end: formatDate(d) }))}
                dateFormat="dd/MM/yyyy"
                locale="es"
                className={dpClassOrange}
                calendarClassName="dark-calendar"
                popperPlacement="bottom-start"
              />
            </div>
          </>
        )}
        {extraFilters}
      </div>
    </div>
  );
}
