import { useState, useMemo, useCallback, useEffect, Fragment } from 'react';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { useTeamMemberPayments } from '../../hooks/useTeamMemberPayments';
import { uploadReceipt, getReceiptUrl, removeReceipt } from '../../utils/storage';
import { formatEuro } from '../../utils/format';

const today = () => new Date().toISOString().split('T')[0];

const ROLES = ['setter', 'closer', 'trafficker', 'procesos', 'otro'];

export default function CobrosView() {
  const { data: members, insert: insertMember, update: updateMember, remove: removeMember } = useTeamMembers();
  const { data: payments, insert: insertPayment, update: updatePayment, remove: removePayment } = useTeamMemberPayments();

  const [memberModal, setMemberModal] = useState({ open: false, data: null });
  const [paymentModal, setPaymentModal] = useState({ open: false, memberId: null, data: null });
  const [expandedId, setExpandedId] = useState(null);
  const [lightboxPath, setLightboxPath] = useState(null);
  const [error, setError] = useState(null);

  // Pagos agrupados por miembro
  const paymentsByMember = useMemo(() => {
    const map = {};
    (payments || []).forEach((p) => {
      if (!map[p.member_id]) map[p.member_id] = [];
      map[p.member_id].push(p);
    });
    return map;
  }, [payments]);

  const memberStats = useCallback((id) => {
    const list = paymentsByMember[id] || [];
    const total = list.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const paid = list.filter((p) => p.paid).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const last = list[0]?.payment_date ?? null;
    return { count: list.length, total, paid, pending: total - paid, last };
  }, [paymentsByMember]);

  const handleSaveMember = async (data) => {
    try {
      if (memberModal.data?.id) {
        const { error: e } = await updateMember(memberModal.data.id, data);
        if (e) throw e;
      } else {
        const { error: e } = await insertMember(data);
        if (e) throw e;
      }
      setMemberModal({ open: false, data: null });
    } catch (err) {
      setError(err.message || 'Error al guardar trabajador');
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`¿Eliminar a ${member.name} y todos sus pagos?`)) return;
    const { error: e } = await removeMember(member.id);
    if (e) setError(e.message);
  };

  const handleSavePayment = async (data, file) => {
    try {
      let receipt_url = data.receipt_url ?? null;
      if (file) {
        const { path, error: upErr } = await uploadReceipt(file, paymentModal.memberId);
        if (upErr) throw upErr;
        receipt_url = path;
      }
      const payload = { ...data, member_id: paymentModal.memberId, receipt_url };
      if (paymentModal.data?.id) {
        const { error: e } = await updatePayment(paymentModal.data.id, payload);
        if (e) throw e;
      } else {
        const { error: e } = await insertPayment(payload);
        if (e) throw e;
      }
      setPaymentModal({ open: false, memberId: null, data: null });
    } catch (err) {
      setError(err.message || 'Error al guardar pago');
    }
  };

  const handleDeletePayment = async (payment) => {
    if (!window.confirm('¿Eliminar este pago?')) return;
    if (payment.receipt_url) await removeReceipt(payment.receipt_url);
    const { error: e } = await removePayment(payment.id);
    if (e) setError(e.message);
  };

  const togglePaid = async (payment) => {
    const { error: e } = await updatePayment(payment.id, { paid: !payment.paid });
    if (e) setError(e.message);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-950/50 border border-red-800 text-red-400 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-red-100">×</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Sección de Cobros</h3>
        <button
          onClick={() => setMemberModal({ open: true, data: null })}
          className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-md hover:bg-yellow-300 text-sm"
        >
          + Trabajador
        </button>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-[10px] uppercase tracking-widest">
            <tr>
              <th className="text-left px-4 py-2">Trabajador</th>
              <th className="text-left px-4 py-2">Banco</th>
              <th className="text-left px-4 py-2">IBAN</th>
              <th className="text-left px-4 py-2">Teléfono</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-right px-4 py-2">Pagado</th>
              <th className="text-right px-4 py-2">Pendiente</th>
              <th className="text-left px-4 py-2">Último</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(members || []).length === 0 && (
              <tr><td colSpan={9} className="text-center text-neutral-500 py-8">Sin trabajadores. Añade el primero con "+ Trabajador".</td></tr>
            )}
            {(members || []).map((m) => {
              const s = memberStats(m.id);
              const isOpen = expandedId === m.id;
              return (
                <Fragment key={m.id}>
                  <tr className="border-t border-neutral-800 hover:bg-neutral-900/40">
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setExpandedId(isOpen ? null : m.id)}
                        className="flex items-center gap-2 text-white hover:text-yellow-400"
                      >
                        <span className="text-xs">{isOpen ? '▾' : '▸'}</span>
                        <span className="font-semibold">{m.name}</span>
                        {m.role && <span className="text-[10px] text-neutral-500 uppercase">{m.role}</span>}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-neutral-300">{m.bank || '—'}</td>
                    <td className="px-4 py-2 text-neutral-300 font-mono text-xs">{m.iban || '—'}</td>
                    <td className="px-4 py-2 text-neutral-300">{m.phone || '—'}</td>
                    <td className="px-4 py-2 text-neutral-300">{m.email || '—'}</td>
                    <td className="px-4 py-2 text-right text-emerald-400 font-bold">{formatEuro(s.paid)}</td>
                    <td className="px-4 py-2 text-right text-yellow-400 font-bold">{formatEuro(s.pending)}</td>
                    <td className="px-4 py-2 text-neutral-300 text-xs">{s.last || '—'}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button onClick={() => setPaymentModal({ open: true, memberId: m.id, data: null })}
                        className="text-yellow-400 hover:text-yellow-300 text-xs font-bold mr-3">+ Pago</button>
                      <button onClick={() => setMemberModal({ open: true, data: m })}
                        className="text-neutral-400 hover:text-white text-xs mr-2">✎</button>
                      <button onClick={() => handleDeleteMember(m)}
                        className="text-red-400/60 hover:text-red-400 text-xs">×</button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-neutral-950/40">
                      <td colSpan={9} className="px-4 py-3">
                        <PaymentList
                          payments={paymentsByMember[m.id] || []}
                          onTogglePaid={togglePaid}
                          onEdit={(p) => setPaymentModal({ open: true, memberId: m.id, data: p })}
                          onDelete={handleDeletePayment}
                          onViewReceipt={(path) => setLightboxPath(path)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {memberModal.open && (
        <MemberFormModal
          initial={memberModal.data}
          onSave={handleSaveMember}
          onClose={() => setMemberModal({ open: false, data: null })}
        />
      )}
      {paymentModal.open && (
        <PaymentFormModal
          initial={paymentModal.data}
          onSave={handleSavePayment}
          onClose={() => setPaymentModal({ open: false, memberId: null, data: null })}
        />
      )}
      {lightboxPath && (
        <ImageLightbox path={lightboxPath} onClose={() => setLightboxPath(null)} />
      )}
    </div>
  );
}

// ── PaymentList: histórico de pagos por miembro ──
function PaymentList({ payments, onTogglePaid, onEdit, onDelete, onViewReceipt }) {
  if (!payments.length) return <div className="text-neutral-500 text-sm">Sin pagos registrados.</div>;
  return (
    <table className="w-full text-xs">
      <thead className="text-neutral-500 text-[10px] uppercase">
        <tr>
          <th className="text-left py-1">Fecha</th>
          <th className="text-left py-1">Concepto</th>
          <th className="text-right py-1">Importe</th>
          <th className="text-center py-1">Justificante</th>
          <th className="text-center py-1">Pagado</th>
          <th className="py-1"></th>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.id} className="border-t border-neutral-800/50">
            <td className="py-1.5 text-neutral-300">{p.payment_date || '—'}</td>
            <td className="py-1.5 text-neutral-300">{p.concept || '—'}</td>
            <td className="py-1.5 text-right text-white font-bold">{formatEuro(p.amount)}</td>
            <td className="py-1.5 text-center">
              {p.receipt_url ? (
                <button onClick={() => onViewReceipt(p.receipt_url)} className="text-yellow-400 hover:text-yellow-300 underline text-xs">Ver</button>
              ) : <span className="text-neutral-600">—</span>}
            </td>
            <td className="py-1.5 text-center">
              <input
                type="checkbox"
                checked={!!p.paid}
                onChange={() => onTogglePaid(p)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </td>
            <td className="py-1.5 text-right whitespace-nowrap">
              <button onClick={() => onEdit(p)} className="text-neutral-400 hover:text-white mr-2">✎</button>
              <button onClick={() => onDelete(p)} className="text-red-400/60 hover:text-red-400">×</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Modal: alta / edición de team_member ──
function MemberFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    role: initial?.role ?? '',
    iban: initial?.iban ?? '',
    bank: initial?.bank ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    notes: initial?.notes ?? '',
    active: initial?.active ?? true,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <ModalShell title={initial ? 'Editar Trabajador' : 'Nuevo Trabajador'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nombre" required>
          <input name="name" value={form.name} onChange={onChange} required className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rol">
            <select name="role" value={form.role} onChange={onChange} className={inputCls}>
              <option value="">--</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Activo">
            <label className="flex items-center gap-2 h-9">
              <input type="checkbox" name="active" checked={form.active} onChange={onChange} className="w-4 h-4 accent-yellow-400" />
              <span className="text-sm text-neutral-300">{form.active ? 'Sí' : 'No'}</span>
            </label>
          </Field>
        </div>
        <Field label="Banco">
          <input name="bank" value={form.bank} onChange={onChange} className={inputCls} />
        </Field>
        <Field label="IBAN">
          <input name="iban" value={form.iban} onChange={onChange} className={inputCls + ' font-mono'} placeholder="ES00 0000 0000 0000 0000 0000" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono">
            <input name="phone" value={form.phone} onChange={onChange} className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" name="email" value={form.email} onChange={onChange} className={inputCls} />
          </Field>
        </div>
        <Field label="Notas">
          <textarea name="notes" value={form.notes} onChange={onChange} rows={2} className={inputCls} />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-md hover:bg-yellow-300">Guardar</button>
          <button type="button" onClick={onClose} className="px-6 bg-neutral-800 text-white font-bold py-2 rounded-md border border-neutral-700 hover:bg-neutral-700">Cancelar</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Modal: alta / edición de team_member_payment ──
function PaymentFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    payment_date: initial?.payment_date ?? today(),
    paid: initial?.paid ?? false,
    concept: initial?.concept ?? '',
    notes: initial?.notes ?? '',
    receipt_url: initial?.receipt_url ?? null,
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFilePreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = (e) => {
    e.preventDefault();
    onSave({
      amount: Number(form.amount) || 0,
      payment_date: form.payment_date || null,
      paid: form.paid,
      concept: form.concept || null,
      notes: form.notes || null,
      receipt_url: form.receipt_url,
    }, file);
  };

  return (
    <ModalShell title={initial ? 'Editar Pago' : 'Nuevo Pago'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Importe (€)" required>
            <input type="number" name="amount" value={form.amount} onChange={onChange} required min={0} step={0.01} className={inputCls} placeholder="0.00" />
          </Field>
          <Field label="Fecha">
            <input type="date" name="payment_date" value={form.payment_date} onChange={onChange} className={inputCls} />
          </Field>
        </div>
        <Field label="Concepto">
          <input name="concept" value={form.concept} onChange={onChange} className={inputCls} placeholder="Ej. Nómina enero, comisión cliente X" />
        </Field>
        <Field label="Justificante (imagen / PDF)">
          <input type="file" accept="image/*,application/pdf" onChange={onFileChange} className="text-sm text-neutral-300" />
          {filePreview && <img src={filePreview} alt="preview" className="mt-2 max-h-32 rounded border border-neutral-700" />}
          {form.receipt_url && !file && <div className="text-xs text-neutral-500 mt-1">Justificante actual guardado: {form.receipt_url}</div>}
        </Field>
        <Field label="Pagado">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="paid" checked={form.paid} onChange={onChange} className="w-4 h-4 accent-emerald-500" />
            <span className="text-sm text-neutral-300">{form.paid ? 'Sí' : 'No'}</span>
          </label>
        </Field>
        <Field label="Notas">
          <textarea name="notes" value={form.notes} onChange={onChange} rows={2} className={inputCls} />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-md hover:bg-yellow-300">Guardar</button>
          <button type="button" onClick={onClose} className="px-6 bg-neutral-800 text-white font-bold py-2 rounded-md border border-neutral-700 hover:bg-neutral-700">Cancelar</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Lightbox: imagen ampliada ──
function ImageLightbox({ path, onClose }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    getReceiptUrl(path).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [path]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {url ? (
          <>
            {/\.pdf$/i.test(path) ? (
              <iframe src={url} className="w-[80vw] h-[80vh] bg-white rounded" title="Justificante" />
            ) : (
              <img src={url} alt="Justificante" className="max-w-full max-h-[80vh] rounded shadow-xl" />
            )}
            <a href={url} target="_blank" rel="noreferrer" className="text-yellow-400 text-sm hover:text-yellow-300">Abrir en pestaña nueva</a>
          </>
        ) : <div className="text-white">Cargando…</div>}
        <button onClick={onClose} className="text-white text-sm bg-neutral-800 px-4 py-1 rounded">Cerrar</button>
      </div>
    </div>
  );
}

// ── Helpers visuales reutilizables dentro del módulo ──
const inputCls = "w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-yellow-500";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
