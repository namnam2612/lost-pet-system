import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

const Login = () => {
    const { login, loading, error, setError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await login({ email: form.email, password: form.password });
            const role = (res?.role || '').toLowerCase();
            const redirectTo = role === 'admin'
                ? '/admin'
                : (location.state?.from || '/');
            navigate(redirectTo, { replace: true });
        } catch {
            /* error handled in context */
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-500">
                            <Mail size={18} className="text-gray-400" />
                            <input
                                type="email"
                                className="flex-1 bg-transparent outline-none text-gray-800"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-500">
                            <Lock size={18} className="text-gray-400" />
                            <input
                                type="password"
                                className="flex-1 bg-transparent outline-none text-gray-800"
                                placeholder="********"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-orange-700 transition-all disabled:opacity-60" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Chưa có tài khoản? <Link to="/register" className="text-orange-600 font-semibold">Đăng ký</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

