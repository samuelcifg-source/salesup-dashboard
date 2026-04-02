import { useState, useEffect } from "react";

const today = () => new Date().toISOString().split("T")[0];

const defaultData = {
  closer: "",
  fecha: today(),
  tipo_llamada: "",
  llamadas: "0",
  llamadas_canceladas: "0",
  llamadas_en_vivo: "0",
  ofertas: "0",
  depositos: "0",
  cierres: "0",
};

export default function CloserKpiForm({ onSubmit, initialData, config }) {
  const [form, setForm] = useState({ ...defaultData });

  useEffect(() => {
    if (initialData) {
      setForm({
        closer: initialData.closer_name ?? "",
        fecha: initialData.date ?? today(),
        tipo_llamada: initialData.call_type ?? "",
        llamadas: initialData.calls_scheduled ?? "0",
        llamadas_canceladas: initialData.calls_cancelled ?? "0",
        llamadas_en_vivo: initialData.live_calls ?? "0",
        ofertas: initialData.offers_made ?? "0",
        depositos: initialData.deposits ?? "0",
        cierres: initialData.closes ?? "0",
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
      closer_name: form.closer,
      date: form.fecha,
      call_type: form.tipo_llamada,
      calls_scheduled: Number(form.llamadas),
      calls_cancelled: Number(form.llamadas_canceladas),
      live_calls: Number(form.llamadas_en_vivo),
      offers_made: Number(form.ofertas),
      deposits: Number(form.depositos),
      closes: Number(form.cierres),
    });
  };

  const labelClass =
    "text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block";
  const inputClass =
    "w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Closer */}
        <div>
          <label className={labelClass}>Closer</label>
          <select
            name="closer"
            value={form.closer}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {(config?.closers ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
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

        {/* Tipo de Llamada */}
        <div>
          <label className={labelClass}>Tipo de Llamada</label>
          <select
            name="tipo_llamada"
            value={form.tipo_llamada}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {(config?.call_types ?? []).map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>

        {/* Llamadas */}
        <div>
          <label className={labelClass}>Llamadas</label>
          <input
            type="number"
            name="llamadas"
            value={form.llamadas}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Llamadas Canceladas */}
        <div>
          <label className={labelClass}>Llamadas Canceladas</label>
          <input
            type="number"
            name="llamadas_canceladas"
            value={form.llamadas_canceladas}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Llamadas en Vivo */}
        <div>
          <label className={labelClass}>Llamadas en Vivo</label>
          <input
            type="number"
            name="llamadas_en_vivo"
            value={form.llamadas_en_vivo}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Ofertas */}
        <div>
          <label className={labelClass}>Ofertas</label>
          <input
            type="number"
            name="ofertas"
            value={form.ofertas}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Depositos */}
        <div>
          <label className={labelClass}>Depositos</label>
          <input
            type="number"
            name="depositos"
            value={form.depositos}
            onChange={handleChange}
            min={0}
            step={1}
            className={inputClass}
          />
        </div>

        {/* Cierres */}
        <div>
          <label className={labelClass}>Cierres</label>
          <input
            type="number"
            name="cierres"
            value={form.cierres}
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
