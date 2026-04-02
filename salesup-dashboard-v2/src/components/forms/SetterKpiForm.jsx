import { useState, useEffect } from "react";

const today = () => new Date().toISOString().split("T")[0];

const defaultData = {
  setter: "",
  fecha: today(),
  total: "0",
  contestaron: "0",
  noContestaron: "0",
  noCualifica: "0",
  whatsapp: "0",
  propuestas: "0",
  agendados: "0",
  seguimiento: "0",
};

export default function SetterKpiForm({ onSubmit, initialData, config }) {
  const [form, setForm] = useState({ ...defaultData });

  useEffect(() => {
    if (initialData) {
      setForm({
        setter: initialData.setter_name ?? "",
        fecha: initialData.date ?? today(),
        total: initialData.total_calls ?? "0",
        contestaron: initialData.answered ?? "0",
        noContestaron: initialData.not_answered ?? "0",
        noCualifica: initialData.not_qualified ?? "0",
        whatsapp: initialData.whatsapp ?? "0",
        propuestas: initialData.proposals ?? "0",
        agendados: initialData.scheduled ?? "0",
        seguimiento: initialData.follow_ups ?? "0",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm({ ...defaultData });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      setter_name: form.setter,
      date: form.fecha,
      total_calls: Number(form.total),
      answered: Number(form.contestaron),
      not_answered: Number(form.noContestaron),
      not_qualified: Number(form.noCualifica),
      whatsapp: Number(form.whatsapp),
      proposals: Number(form.propuestas),
      scheduled: Number(form.agendados),
      follow_ups: Number(form.seguimiento),
    });
  };

  const labelClass =
    "text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block";
  const inputClass =
    "w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Setter */}
        <div>
          <label className={labelClass}>Setter</label>
          <select
            name="setter"
            value={form.setter}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {(config?.setters ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className={labelClass}>Fecha</label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Total */}
        <div>
          <label className={labelClass}>Total</label>
          <input
            type="number"
            name="total"
            value={form.total}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Contestaron */}
        <div>
          <label className={labelClass}>Contestaron</label>
          <input
            type="number"
            name="contestaron"
            value={form.contestaron}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* No Contestaron */}
        <div>
          <label className={labelClass}>No Contestaron</label>
          <input
            type="number"
            name="noContestaron"
            value={form.noContestaron}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* No Cualifica */}
        <div>
          <label className={labelClass}>No Cualifica</label>
          <input
            type="number"
            name="noCualifica"
            value={form.noCualifica}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input
            type="number"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Propuestas */}
        <div>
          <label className={labelClass}>Propuestas</label>
          <input
            type="number"
            name="propuestas"
            value={form.propuestas}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Agendados */}
        <div>
          <label className={labelClass}>Agendados</label>
          <input
            type="number"
            name="agendados"
            value={form.agendados}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Seguimiento */}
        <div>
          <label className={labelClass}>Seguimiento</label>
          <input
            type="number"
            name="seguimiento"
            value={form.seguimiento}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-bold py-2 rounded-md hover:bg-yellow-300 transition-colors"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 bg-neutral-800 text-white font-bold py-2 rounded-md border border-neutral-700 hover:bg-neutral-700 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
