import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-yellow-400 mb-2">SALESUP</div>
          <div className="text-neutral-500 text-sm">Dashboard v2</div>
        </div>
        <form onSubmit={handleSubmit} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
          {error && <div className="bg-red-950/30 border border-red-800/40 text-red-400 text-sm rounded-lg p-3">{error}</div>}
          <div>
            <label className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black font-bold py-2 rounded-md hover:bg-yellow-300 transition disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
