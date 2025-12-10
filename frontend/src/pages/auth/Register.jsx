import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock } from 'lucide-react';

const Register = () => {
    const { register, loading, error, setError } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register({ email: form.email, name: form.name || 'Thành viên', password: form.password, phone: form.phone });
            navigate('/', { replace: true });
        } catch {
            /* error handled in context */
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Đăng ký</h1>
                        <p className="text-gray-500 text-sm">Tạo tài khoản thành viên</p>
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                            placeholder="Nguyễn Văn A"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <input
                            type="tel"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                            placeholder="0901234567"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500">
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
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-60" disabled={loading}>
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Đã có tài khoản? <Link to="/login" className="text-blue-600 font-semibold">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

