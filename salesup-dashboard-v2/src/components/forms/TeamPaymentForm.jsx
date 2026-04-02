import { useState, useEffect } from "react";

const today = () => new Date().toISOString().split("T")[0];

const ROLES = ["closer", "setter", "trafficker", "procesos", "agency"];

const defaultData = {
  person_name: "",
  role: "",
  amount: "",
  date: today(),
  concept: "",
  payment_method: "",
};

export default function TeamPaymentForm({ onSubmit, initialData, config }) {
  const [form, setForm] = useState({ ...defaultData });

  useEffect(() => {
    if (initialData) {
      setForm({
        person_name: initialData.person_name ?? "",
        role: initialData.role ?? "",
        amount: initialData.amount ?? "",
        date: initialData.date ?? today(),
        concept: initialData.concept ?? "",
        payment_method: initialData.payment_method ?? "",
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
      person_name: form.person_name,
      role: form.role,
      amount: Number(form.amount),
      date: form.date,
      concept: form.concept,
      payment_method: form.payment_method,
    });
  };

  const labelClass =
    "text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block";
  const inputClass =
    "w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Person Name */}
        <div>
          <label className={labelClass}>Person Name</label>
          <input
            type="text"
            name="person_name"
            value={form.person_name}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Nombre de la persona"
          />
        </div>

        {/* Role */}
        <div>
          <label className={labelClass}>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            min={0}
            step={0.01}
            className={inputClass}
            placeholder="0.00"
          />
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Concept */}
        <div>
          <label className={labelClass}>Concept</label>
          <input
            type="text"
            name="concept"
            value={form.concept}
            onChange={handleChange}
            className={inputClass}
            placeholder="Concepto del pago"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className={labelClass}>Payment Method</label>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- Seleccionar --</option>
            {(config?.payment_methods ?? []).map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
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
