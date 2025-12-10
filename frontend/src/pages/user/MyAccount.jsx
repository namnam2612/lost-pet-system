import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MyAccount = () => {
    const { user, logout, setError, error } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
        }
    }, [user]);

    const save = () => {
        if (!user?.id) return;
        if (!form.phone) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }
        setLoading(true); setError('');
        axios.put(`${API_URL}/users/${user.id}`, { name: form.name, phone: form.phone })
            .then(res => {
                // cập nhật lại context user
                const updated = res.data;
                window.localStorage.setItem('pf_auth_user', JSON.stringify(updated));
                window.dispatchEvent(new Event('storage')); // notify others
                setLoading(false);
            })
            .catch(err => {
                setError(err?.response?.data?.message || 'Lưu thất bại');
                setLoading(false);
            });
    };

    const removeAccount = () => {
        if (!user?.id) return;
        if (!window.confirm('Xóa tài khoản sẽ mất toàn bộ dữ liệu. Tiếp tục?')) return;
        setLoading(true); setError('');
        axios.delete(`${API_URL}/users/${user.id}`)
            .then(() => {
                logout();
                navigate('/', { replace: true });
            })
            .catch(err => {
                setError(err?.response?.data?.message || 'Xóa thất bại');
                setLoading(false);
            });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center space-y-4">
                    <p className="text-gray-700 font-semibold">Vui lòng đăng nhập để quản lý tài khoản.</p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/login" className="px-5 py-2 rounded-full bg-orange-600 text-white font-bold">Đăng nhập</Link>
                        <Link to="/register" className="px-5 py-2 rounded-full border border-gray-200 text-gray-700 font-bold">Đăng ký</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-6">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
                <h1 className="text-3xl font-black text-gray-900 mb-6">Tài khoản của tôi</h1>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" value={form.email} disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex flex-col md:flex-row gap-3 mt-2">
                        <button onClick={save} disabled={loading} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60">
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button onClick={removeAccount} disabled={loading} className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 disabled:opacity-60">
                            Xóa tài khoản
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccount;

