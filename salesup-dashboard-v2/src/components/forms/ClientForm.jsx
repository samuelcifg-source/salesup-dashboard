import { useState, useEffect } from "react";

const today = () => new Date().toISOString().split("T")[0];

const defaultData = {
  nombre: "",
  pais: "España",
  fecha_inicio: today(),
  setter: "",
  closer: "",
  source: "",
  nicho: "",
  metodo_pago: "",
  ticket: "",
  cash_collected: "0",
};

export default function ClientForm({ onSubmit, initialData, config }) {
  const [form, setForm] = useState({ ...defaultData });

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.name ?? "",
        pais: initialData.country ?? "España",
        fecha_inicio: initialData.start_date ?? today(),
        setter: initialData.setter ?? "",
        closer: initialData.closer ?? "",
        source: initialData.source ?? "",
        nicho: initialData.offer ?? "",
        metodo_pago: initialData.payment_type ?? "",
        ticket: initialData.revenue ?? "",
        cash_collected: initialData.cash ?? "0",
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
      name: form.nombre,
      country: form.pais,
      start_date: form.fecha_inicio,
      setter: form.setter,
      closer: form.closer,
      source: form.source,
      offer: form.nicho,
      payment_type: form.metodo_pago,
      revenue: Number(form.ticket),
      cash: Number(form.cash_collected),
    });
  };

  const labelClass =
    "text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block";
  const inputClass =
    "w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nombre */}
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Nombre del cliente"
          />
        </div>

        {/* Pais */}
        <div>
          <label className={labelClass}>Pais</label>
          <input
            type="text"
            name="pais"
            value={form.pais}
            onChange={handleChange}
            className={inputClass}
            placeholder="Pais"
          />
        </div>

        {/* Fecha Inicio */}
        <div>
          <label className={labelClass}>Fecha Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Setter */}
        <div>
          <label className={labelClass}>Setter</label>
          <select
            name="setter"
            value={form.setter}
            onChange={handleChange}
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

        {/* Closer */}
        <div>
          <label className={labelClass}>Closer</label>
          <select
            name="closer"
            value={form.closer}
            onChange={handleChange}
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

        {/* Source */}
        <div>
          <label className={labelClass}>Source</label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {(config?.sources ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Nicho */}
        <div>
          <label className={labelClass}>Nicho</label>
          <select
            name="nicho"
            value={form.nicho}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {(config?.offers ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Metodo de Pago */}
        <div>
          <label className={labelClass}>Metodo de Pago</label>
          <select
            name="metodo_pago"
            value={form.metodo_pago}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {(config?.payment_types ?? []).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Ticket */}
        <div>
          <label className={labelClass}>Ticket</label>
          <input
            type="number"
            name="ticket"
            value={form.ticket}
            onChange={handleChange}
            required
            min={0}
            step={0.01}
            className={inputClass}
            placeholder="0.00"
          />
        </div>

        {/* Cash Collected */}
        <div>
          <label className={labelClass}>Cash Collected</label>
          <input
            type="number"
            name="cash_collected"
            value={form.cash_collected}
            onChange={handleChange}
            min={0}
            step={0.01}
            className={inputClass}
            placeholder="0.00"
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
