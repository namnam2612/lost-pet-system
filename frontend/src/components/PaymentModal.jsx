import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle } from 'lucide-react';
import { API_URL } from '../api/config';

const PaymentModal = ({ requestId, onClose, onPaymentSuccess }) => {
    const [billFile, setBillFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);
    const [adminInfo, setAdminInfo] = useState(null);
    const [amount] = useState(500000); // default amount in VND

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBillFile(file);
        }
    };

    // fetch admin payment info on mount
    useEffect(() => {
        let mounted = true;
        console.log('PaymentModal: fetching admin info from', `${API_URL}/users/admin`);
        axios.get(`${API_URL}/users/admin`)
            .then(res => {
                console.log('PaymentModal: admin info fetched successfully:', res.data);
                if (mounted) setAdminInfo(res.data);
            })
            .catch(err => {
                console.error('PaymentModal: failed to fetch admin info:', err.response?.status, err.response?.data || err.message);
                if (mounted) setAdminInfo(null);
            });
        return () => { mounted = false; };
    }, []);

    const formatVnd = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VND';

    const handleSubmitPayment = async () => {
        if (!billFile) {
            alert('Vui lòng chọn ảnh bill');
            return;
        }

        setUploading(true);
        try {
            // upload bill image
            const uploadData = new FormData();
            uploadData.append('file', billFile);
            console.log('Uploading bill to:', `${API_URL}/upload`, 'with file:', billFile.name);
            const uploadRes = await axios.post(`${API_URL}/upload`, uploadData);
            const billImageUrl = uploadRes.data;
            console.log('Bill uploaded successfully:', billImageUrl);

            // upload only the bill image for admin review; do NOT mark as PAID automatically
            console.log('Uploading bill info for service', requestId, 'with billImageUrl:', billImageUrl);
            await axios.put(`${API_URL}/services/${requestId}/payment`, {
                billImageUrl: billImageUrl
            });
            console.log('Bill uploaded successfully and awaits admin confirmation');

            // show user that bill was submitted and is awaiting admin confirmation
            setPaymentSubmitted(true);
            if (onPaymentSuccess) {
                setTimeout(() => {
                    onPaymentSuccess();
                    onClose();
                }, 1200);
            }
        } catch (err) {
            console.error('Payment error:', err);
            console.error('Error details:', err.response?.data || err.message);
            alert('Lỗi khi gửi bill. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Thanh Toán Dịch Vụ</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {!paymentSubmitted ? (
                    <div className="space-y-6">
                        <div className="bg-orange-50 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-gray-900 mb-2">📱 Mã QR Thanh Toán:</p>
                            <div className="bg-white p-4 rounded-lg flex items-center justify-center h-40 border-2 border-orange-200">
                                {adminInfo?.qrImageUrl ? (
                                    <img src={adminInfo.qrImageUrl} alt="QR" className="object-contain max-h-36" />
                                ) : (
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">📲</div>
                                        <p className="text-xs text-gray-500">QR Code sẽ hiển thị ở đây</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-gray-900 mb-2">🏦 Thông Tin Tài Khoản:</p>
                            <div className="text-sm text-gray-700 space-y-1">
                                {adminInfo ? (
                                    <>
                                        <p><strong>Ngân hàng:</strong> {adminInfo.bankName || '—'}</p>
                                        <p><strong>Số tài khoản:</strong> {adminInfo.bankAccountNumber || '—'}</p>
                                        <p><strong>Chủ tài khoản:</strong> {adminInfo.bankAccountHolder || '—'}</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-red-600">⚠️ Chưa có thông tin ngân hàng. Admin vui lòng cập nhật trong tài khoản.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="p-4 bg-white rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-600">Số tiền cần chuyển</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatVnd(amount)}</p>
                                <p className="text-xs text-gray-500 mt-2">Số tiền mặc định: người dùng không thể thay đổi.</p>
                            </div>

                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                📷 Tải lên ảnh Bill chuyển khoản
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                            {billFile && (
                                <p className="text-xs text-green-600 mt-2">✓ Đã chọn: {billFile.name}</p>
                            )}
                        </div>

                        <button
                            onClick={handleSubmitPayment}
                            disabled={!billFile || uploading}
                            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-all disabled:opacity-60"
                        >
                            {uploading ? 'Đang xử lý...' : '✓ Xác nhận thanh toán'}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            Sau khi xác nhận, admin sẽ kiểm tra bill và xác nhận dịch vụ cho bạn.
                        </p>

                        {/* Debug info (remove in production) */}
                        <div className="mt-6 pt-4 border-t border-gray-100 bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                            <p className="font-semibold mb-1">🔍 Debug Info:</p>
                            <p>Admin Info Status: {adminInfo ? '✅ Loaded' : '❌ Not loaded'}</p>
                            {adminInfo && <p>Bank: {adminInfo.bankName || '(empty)'} | Account: {adminInfo.bankAccountNumber || '(empty)'}</p>}
                            <p>API URL: {API_URL}/users/admin</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle size={48} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Hoàn tất tải lên bill</h3>
                        <p className="text-sm text-gray-600">
                            Bill đã được gửi, vui lòng đợi admin xác nhận thanh toán. Bạn sẽ nhận được thông báo khi admin duyệt.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
