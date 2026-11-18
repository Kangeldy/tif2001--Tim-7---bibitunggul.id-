// ============================================================
// pages/LoginPage.tsx
// ============================================================
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) return setError(error);
    navigate('/dashboard');
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Masuk ke Sistem</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="admin@bibitunggul.id"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Masuk
        </Button>
      </form>
    </Card>
  );
}

