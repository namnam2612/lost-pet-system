import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api';

const AdminServiceRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    const STATUS_MAP = {
        'CREATED': 'MỚI TẠO',
        'PENDING': 'MỚI TẠO',
        'PROCESSING': 'ĐANG TÌM KIẾM',
        'REJECTED': 'TỪ CHỐI',
        'COMPLETED': 'HOÀN THÀNH',
        'FOUND': 'ĐÃ TÌM THẤY',
        'NOT_FOUND': 'KHÔNG TÌM THẤY',
        'PAYMENT_INVALID': 'THANH TOÁN LỖI'
    };

    const PAYMENT_MAP = {
        'PAID': 'ĐÃ THANH TOÁN',
        'REFUNDED': 'ĐÃ HOÀN TIỀN',
        'PENDING_VERIFICATION': 'CHỜ DUYỆT',
        'PAYMENT_INVALID': 'THANH TOÁN LỖI',
        'UNPAID': 'CHƯA THANH TOÁN'
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/services`);
            // Sort: Pending payment first, then new requests
            setRequests(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentAction = async (id, status) => {
        if (!window.confirm(`Xác nhận trạng thái thanh toán: ${status}?`)) return;
        try {
            await axios.put(`${API_URL}/services/${id}/payment`, { status });
            fetchRequests();
            setSelectedBill(null);
        } catch (error) {
            alert("Lỗi cập nhật");
        }
    };

    const handleDecision = async (id, found) => {
        if (!window.confirm(found ? "Xác nhận ĐÃ TÌM THẤY?" : "Xác nhận KHÔNG TÌM THẤY?")) return;
        try {
            await axios.put(`${API_URL}/services/${id}/decision?found=${found}`);
            fetchRequests();
        } catch (error) {
            alert("Lỗi cập nhật");
        }
    };

    const handleRefund = async (id) => {
        if (!window.confirm("Xác nhận HOÀN TIỀN cho user này?")) return;
        try {
            await axios.put(`${API_URL}/services/${id}/refund`);
            fetchRequests();
        } catch (error) {
            alert("Lỗi hoàn tiền: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900">🛡️ Quản lý Yêu Cầu Cứu Hộ</h1>
                    <Link to="/admin" className="text-gray-500 hover:text-orange-600 font-bold">Quay lại Dashboard</Link>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-gray-600">ID</th>
                                <th className="p-4 font-bold text-gray-600">User / Liên hệ</th>
                                <th className="p-4 font-bold text-gray-600">Thông tin Pet</th>
                                <th className="p-4 font-bold text-gray-600">Thanh toán</th>
                                <th className="p-4 font-bold text-gray-600">Trạng thái</th>
                                <th className="p-4 font-bold text-gray-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold">#{req.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold">{req.contactName}</div>
                                        <div className="text-xs text-gray-500">{req.contactPhone}</div>
                                    </td>
                                    <td className="p-4 text-sm max-w-xs truncate">{req.petDescription}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${req.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                                            req.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                                                req.paymentStatus === 'PAYMENT_INVALID' ? 'bg-red-100 text-red-700' :
                                                    req.paymentStatus === 'PENDING_VERIFICATION' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-500'
                                            }`}>
                                            {PAYMENT_MAP[req.paymentStatus] || 'CHƯA THANH TOÁN'}
                                        </span>
                                        {req.billImageUrl && req.paymentStatus !== 'PAID' && req.paymentStatus !== 'REFUNDED' && (
                                            <button onClick={() => setSelectedBill(req)} className="ml-2 text-blue-600 text-xs underline font-bold">🔍 Xem Bill</button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'FOUND' ? 'bg-green-100 text-green-700' : req.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {STATUS_MAP[req.status] || req.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2 flex-wrap">
                                        {req.paymentStatus === 'PAID' && req.status !== 'FOUND' && req.status !== 'REFUNDED_NOT_FOUND' && (
                                            <>
                                                <button onClick={() => handleDecision(req.id, true)} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Đã tìm thấy</button>
                                                <button onClick={() => handleDecision(req.id, false)} className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">Không thấy</button>
                                            </>
                                        )}
                                        {(req.status === 'NOT_FOUND' || req.status === 'PAYMENT_INVALID') && req.paymentStatus !== 'REFUNDED' && (
                                            <button onClick={() => handleRefund(req.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Hoàn tiền</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal xem bill */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setSelectedBill(null)}>
                    <div className="bg-white p-6 rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Duyệt Bill - Yêu cầu #{selectedBill.id}</h3>
                        <img src={selectedBill.billImageUrl} alt="Bill" className="w-full rounded-lg mb-4 border" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => handlePaymentAction(selectedBill.id, 'PAYMENT_INVALID')} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold">Không hợp lệ</button>
                            <button onClick={() => handlePaymentAction(selectedBill.id, 'PAID')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">Xác nhận PAID</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServiceRequest;