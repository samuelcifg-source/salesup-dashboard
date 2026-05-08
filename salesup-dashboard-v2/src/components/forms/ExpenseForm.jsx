import { useState, useEffect } from "react";

const today = () => new Date().toISOString().split("T")[0];

const CATEGORIES = [
  "herramientas",
  "ads",
  "personal",
  "portadas",
  "reels",
  "imagenes",
  "otros",
];

const HERRAMIENTAS_PRESETS = ["claude", "chatgpt", "n8n", "otro"];

const defaultData = {
  description: "",
  is_percentage: false,
  amount: "",
  percentage: "",
  category: "",
  subcategory: "",
  subcategory_custom: "",
  date: today(),
  recurring: false,
};

export default function ExpenseForm({ onSubmit, initialData, config }) {
  const [form, setForm] = useState({ ...defaultData });

  useEffect(() => {
    if (initialData) {
      const cat = initialData.category ?? "";
      const sub = initialData.subcategory ?? "";
      const isPreset = cat === "herramientas" && HERRAMIENTAS_PRESETS.includes(sub) && sub !== "otro";
      setForm({
        description: initialData.description ?? "",
        is_percentage: initialData.is_percentage ?? false,
        amount: initialData.amount ?? "",
        percentage: initialData.percentage ?? "",
        category: cat,
        subcategory: cat === "herramientas" ? (isPreset ? sub : (sub ? "otro" : "")) : "",
        subcategory_custom: cat === "herramientas" && !isPreset ? sub : "",
        date: initialData.date ?? today(),
        recurring: initialData.recurring ?? false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      // Reset subcategory si la categoría deja de ser herramientas
      if (name === "category" && value !== "herramientas") {
        next.subcategory = "";
        next.subcategory_custom = "";
      }
      return next;
    });
  };

  const handleReset = () => {
    setForm({ ...defaultData });
  };

  const resolveSubcategory = () => {
    if (form.category !== "herramientas") return null;
    if (!form.subcategory) return null;
    if (form.subcategory === "otro") return form.subcategory_custom.trim() || null;
    return form.subcategory;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      description: form.description,
      is_percentage: form.is_percentage,
      amount: form.is_percentage ? null : Number(form.amount),
      percentage: form.is_percentage ? Number(form.percentage) : null,
      category: form.category,
      subcategory: resolveSubcategory(),
      date: form.date,
      recurring: form.recurring,
    });
  };

  const labelClass =
    "text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block";
  const inputClass =
    "w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Description */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className={labelClass}>Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Descripcion del gasto"
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory — solo si categoría = herramientas */}
        {form.category === "herramientas" && (
          <div>
            <label className={labelClass}>Herramienta</label>
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">-- Seleccionar --</option>
              {HERRAMIENTAS_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subcategory custom — solo si herramientas + otro */}
        {form.category === "herramientas" && form.subcategory === "otro" && (
          <div>
            <label className={labelClass}>Especificar</label>
            <input
              type="text"
              name="subcategory_custom"
              value={form.subcategory_custom}
              onChange={handleChange}
              className={inputClass}
              placeholder="Nombre de la herramienta"
            />
          </div>
        )}

        {/* Is Percentage */}
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_percentage"
              checked={form.is_percentage}
              onChange={handleChange}
              className="w-4 h-4 accent-yellow-400 bg-black border-neutral-700 rounded"
            />
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">
              Es Porcentaje
            </span>
          </label>
        </div>

        {/* Amount (shown when NOT percentage) */}
        {!form.is_percentage && (
          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min={0}
              step={0.01}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
        )}

        {/* Percentage (shown when IS percentage) */}
        {form.is_percentage && (
          <div>
            <label className={labelClass}>Percentage</label>
            <input
              type="number"
              name="percentage"
              value={form.percentage}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.1}
              className={inputClass}
              placeholder="0.0"
            />
          </div>
        )}

        {/* Date */}
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* Recurring */}
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="recurring"
              checked={form.recurring}
              onChange={handleChange}
              className="w-4 h-4 accent-yellow-400 bg-black border-neutral-700 rounded"
            />
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">
              Recurrente
            </span>
          </label>
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
