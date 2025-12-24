import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Check, AlertCircle, XCircle, DollarSign } from 'lucide-react';
import { API_URL } from '../../api/config';
import Pagination from '../../components/Pagination';

const AdminServiceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState(''); // '', 'PAID', 'UNPAID'
    const [filterReqStatus, setFilterReqStatus] = useState(''); // '', 'PENDING', 'PROCESSING', 'COMPLETED'
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        setLoading(true);
        axios.get(`${API_URL}/services`)
            .then(res => {
                // Sort by createdAt descending
                const sorted = res.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setRequests(sorted);
            })
            .catch(err => {
                console.error('Error fetching requests:', err);
                setRequests([]);
            })
            .finally(() => setLoading(false));
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Xác nhận TỪ CHỐI yêu cầu này (Spam/Bill lỗi)?')) return;
        try {
            await axios.put(`${API_URL}/services/${requestId}/status?status=REJECTED`);
            fetchRequests();
            alert('✓ Đã từ chối yêu cầu.');
        } catch (err) {
            console.error('Error confirming service:', err);
            alert('Lỗi cập nhật trạng thái');
        }
    };

    // Admin confirms payment
    const handleConfirmPayment = async (requestId) => {
        if (!window.confirm('Xác nhận đã thanh toán (Thu tiền) cho yêu cầu này?')) return;

        try {
            await axios.put(`${API_URL}/services/${requestId}/payment`, { status: 'PAID' });
            fetchRequests();
            alert('✓ Đã xác nhận thanh toán!');
        } catch (err) {
            console.error('Error confirming payment:', err);
            alert('Lỗi khi xác nhận thanh toán');
        }
    };

    const openBillModal = (request) => {
        setSelectedRequest(request);
        setShowBillModal(true);
    };

    const closeBillModal = () => {
        setShowBillModal(false);
        setSelectedRequest(null);
    };

    // Filter requests
    let filteredRequests = requests;
    if (filterStatus) {
        filteredRequests = filteredRequests.filter(r => r.paymentStatus === filterStatus);
    }
    if (filterReqStatus) {
        filteredRequests = filteredRequests.filter(r => r.status === filterReqStatus);
    }

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusBadgeColor = (status) => {
        if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
        if (status === 'CREATED') return 'bg-gray-100 text-gray-800';
        if (status === 'REJECTED') return 'bg-red-100 text-red-800';
        if (status === 'PROCESSING') return 'bg-blue-100 text-blue-800';
        if (status === 'COMPLETED') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getPaymentBadgeColor = (status) => {
        if (status === 'PAID') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-500';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-8 font-medium transition-colors">
                    <ArrowRight className="rotate-180" size={20} /> Quay lại Admin
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-900 p-8 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">Quản Lý Yêu Cầu Cứu Hộ</h2>
                        <p className="text-gray-400">Kiểm duyệt thanh toán và xác nhận dịch vụ</p>
                    </div>

                    {/* Filter Section */}
                    <div className="p-8 border-b border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái thanh toán</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-orange-500 focus:outline-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="UNPAID">Chưa thanh toán</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái yêu cầu</label>
                                <select
                                    value={filterReqStatus}
                                    onChange={(e) => setFilterReqStatus(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-orange-500 focus:outline-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="PENDING">Chưa xử lý</option>
                                    <option value="CREATED">Mới tạo (Chờ bill)</option>
                                    <option value="PROCESSING">Đang xử lý</option>
                                    <option value="COMPLETED">Hoàn tất</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                            Tổng cộng: <strong>{filteredRequests.length}</strong> yêu cầu
                        </p>
                    </div>

                    {/* Requests Table */}
                    <div className="p-8">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Đang tải...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Không có yêu cầu nào</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">ID</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">Người liên hệ</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">ĐT</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">Địa điểm</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">Thanh toán</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">Yêu cầu</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">Gửi lúc</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-900">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRequests.map(req => (
                                            <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4 font-bold text-orange-600">#{req.id}</td>
                                                <td className="py-4 px-4 text-gray-900">{req.contactName}</td>
                                                <td className="py-4 px-4 text-gray-700">{req.contactPhone}</td>
                                                <td className="py-4 px-4 text-gray-700 max-w-[120px] truncate">{req.lastSeenLocation}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getPaymentBadgeColor(req.paymentStatus)}`}>
                                                            {req.paymentStatus === 'PAID' ? '✓ Đã TT' : '✗ Chưa TT'}
                                                        </span>
                                                        {/* show small note if bill uploaded and not yet confirmed */}
                                                        {req.billImageUrl && req.paymentStatus !== 'PAID' && (
                                                            <span className="text-xs text-orange-600 mt-1">● Bill đã gửi - chờ duyệt</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(req.status)}`}>
                                                        {req.status === 'CREATED' ? 'Mới tạo' : req.status === 'PROCESSING' ? 'Đang tìm kiếm' : req.status === 'REJECTED' ? 'Từ chối' : req.status === 'FOUND' ? 'Đã tìm thấy' : req.status === 'NOT_FOUND' ? 'Không thấy' : req.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600 text-xs">{formatDate(req.createdAt)}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex gap-2">
                                                        {req.billImageUrl && (
                                                            <button
                                                                onClick={() => openBillModal(req)}
                                                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs font-bold"
                                                                title="Xem hóa đơn"
                                                            >
                                                                <Eye size={16} /> Bill
                                                            </button>
                                                        )}

                                                        {/* Fast Flow: Actions for PROCESSING requests */}
                                                        {req.status === 'PROCESSING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => { if (window.confirm('Xác nhận đã tìm thấy?')) axios.put(`${API_URL}/services/${req.id}/decision?found=true`).then(fetchRequests); }}
                                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-xs font-bold"
                                                                    title="Đã tìm thấy"
                                                                >
                                                                    <Check size={16} /> Đã tìm thấy
                                                                </button>
                                                                <button
                                                                    onClick={() => { if (window.confirm('Xác nhận chưa tìm thấy?')) axios.put(`${API_URL}/services/${req.id}/decision?found=false`).then(fetchRequests); }}
                                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors text-xs font-bold"
                                                                    title="Chưa tìm thấy"
                                                                >
                                                                    <AlertCircle size={14} /> Chưa tìm thấy
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(req.id)}
                                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs font-bold"
                                                                    title="Từ chối / Spam"
                                                                >
                                                                    <XCircle size={14} /> Spam
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <Pagination
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredRequests.length}
                            paginate={paginate}
                            currentPage={currentPage}
                        />
                    </div>
                </div>
            </div>

            {/* Bill Image Modal */}
            {showBillModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">
                                Hóa đơn thanh toán - Yêu cầu #{selectedRequest.id}
                            </h3>
                            <button
                                onClick={closeBillModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <img
                                src={selectedRequest.billImageUrl}
                                alt="Bill"
                                className="w-full rounded-lg border border-gray-200"
                            />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-bold text-gray-900 mb-3">Thông tin yêu cầu</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Người liên hệ</p>
                                        <p className="font-bold text-gray-900">{selectedRequest.contactName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Điện thoại</p>
                                        <p className="font-bold text-gray-900">{selectedRequest.contactPhone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Địa điểm</p>
                                        <p className="font-bold text-gray-900">{selectedRequest.lastSeenLocation}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Ngày gửi</p>
                                        <p className="font-bold text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServiceRequests;
