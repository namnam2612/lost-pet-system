import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MyAccount = () => {
    const { user, logout, setError, error } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [savedInfo, setSavedInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '', email: user.email || '', phone: user.phone || '',
                bankName: user.bankName || '', bankAccountNumber: user.bankAccountNumber || '', bankAccountHolder: user.bankAccountHolder || '', qrImageUrl: user.qrImageUrl || ''
            });
            setSavedInfo({
                name: user.name || '', email: user.email || '', phone: user.phone || '',
                bankName: user.bankName || '', bankAccountNumber: user.bankAccountNumber || '', bankAccountHolder: user.bankAccountHolder || '', qrImageUrl: user.qrImageUrl || ''
            });
        }
    }, [user]);

    const save = () => {
        if (!user?.id) return;
        if (!form.phone) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }
        setLoading(true); setError('');
        const payload = { name: form.name, phone: form.phone };
        if (user.role?.toLowerCase() === 'admin') {
            payload.bankName = form.bankName || '';
            payload.bankAccountNumber = form.bankAccountNumber || '';
            payload.bankAccountHolder = form.bankAccountHolder || '';
            payload.qrImageUrl = form.qrImageUrl || '';
        }
        // add debug logs to help diagnose failures
        console.log('MyAccount.save payload ->', { url: `${API_URL}/users/${user.id}`, payload, userId: user?.id });
        axios.put(`${API_URL}/users/${user.id}`, payload)
            .then(res => {
                console.log('MyAccount.save response ->', res.status, res.data);
                // cập nhật lại context user and local display
                const updated = res.data;
                try {
                    window.localStorage.setItem('pf_auth_user', JSON.stringify(updated));
                    // dispatch a custom event so other parts can listen if needed
                    window.dispatchEvent(new Event('pf_auth_user_updated'));
                } catch (e) {
                    console.warn('Could not update localStorage', e);
                }
                setSavedInfo({
                    name: updated.name || '', email: updated.email || '', phone: updated.phone || '',
                    bankName: updated.bankName || '', bankAccountNumber: updated.bankAccountNumber || '', bankAccountHolder: updated.bankAccountHolder || '', qrImageUrl: updated.qrImageUrl || ''
                });
                // also update form to reflect saved values
                setForm(prev => ({
                    ...prev, ...{
                        name: updated.name || prev.name,
                        phone: updated.phone || prev.phone,
                        bankName: updated.bankName || prev.bankName,
                        bankAccountNumber: updated.bankAccountNumber || prev.bankAccountNumber,
                        bankAccountHolder: updated.bankAccountHolder || prev.bankAccountHolder,
                        qrImageUrl: updated.qrImageUrl || prev.qrImageUrl
                    }
                }));
                setLoading(false);
                // Show success message
                setError('');
                alert('✅ Lưu thông tin thành công!');
            })
            .catch(err => {
                console.error('MyAccount.save error ->', err);
                const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
                setError(serverMsg || 'Lưu thất bại');
                setLoading(false);
            });
    };

    const handleQrFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('file', file);
        setLoading(true);
        axios.post(`${API_URL}/upload`, uploadData)
            .then(res => {
                setForm(prev => ({ ...prev, qrImageUrl: res.data }));
                setLoading(false);
            })
            .catch(err => {
                setError('Lỗi upload QR');
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
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
                <h1 className="text-3xl font-black text-gray-900 mb-6">Tài khoản của tôi</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Edit form */}
                    <div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                                <input className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" value={form.email} disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                <input className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            </div>

                            {user.role?.toLowerCase() === 'admin' && (
                                <div className="p-4 mt-4 border-t border-gray-100">
                                    <h3 className="text-lg font-bold mb-3">Thông tin thanh toán (hiển thị cho người dùng)</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
                                            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.bankName || ''} onChange={e => setForm({ ...form, bankName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
                                            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.bankAccountNumber || ''} onChange={e => setForm({ ...form, bankAccountNumber: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Chủ tài khoản</label>
                                            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.bankAccountHolder || ''} onChange={e => setForm({ ...form, bankAccountHolder: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Mã QR thanh toán</label>
                                            <div className="flex items-center gap-3">
                                                <input type="file" onChange={handleQrFileChange} />
                                                {form.qrImageUrl && <img src={form.qrImageUrl} alt="QR" className="w-20 h-20 object-cover rounded-md border" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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

                    {/* Right: Saved info */}
                    <div>
                        <div className="p-6 bg-gray-50 rounded-xl h-full">
                            <h3 className="text-xl font-bold mb-4">Thông tin đã lưu</h3>
                            {savedInfo ? (
                                <div className="space-y-4 text-sm text-gray-700">
                                    <div>
                                        <p className="text-gray-500">Họ tên</p>
                                        <p className="font-semibold text-gray-900">{savedInfo.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-semibold text-gray-900">{savedInfo.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Số điện thoại</p>
                                        <p className="font-semibold text-gray-900">{savedInfo.phone}</p>
                                    </div>
                                    {user.role?.toLowerCase() === 'admin' && (
                                        <>
                                            <div>
                                                <p className="text-gray-500">Ngân hàng</p>
                                                <p className="font-semibold text-gray-900">{savedInfo.bankName || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Số tài khoản</p>
                                                <p className="font-semibold text-gray-900">{savedInfo.bankAccountNumber || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Chủ tài khoản</p>
                                                <p className="font-semibold text-gray-900">{savedInfo.bankAccountHolder || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Mã QR</p>
                                                {savedInfo.qrImageUrl ? (
                                                    <img src={savedInfo.qrImageUrl} alt="QR" className="w-36 h-36 object-cover rounded-md border" />
                                                ) : (
                                                    <p className="text-sm text-gray-500">Chưa cung cấp mã QR</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Chưa có thông tin nào được lưu.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccount;





