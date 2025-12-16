import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle, DollarSign } from 'lucide-react';
import { API_URL } from '../../api/config';

const AdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('requests');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    const fetchData = () => {
        axios.get(`${API_URL}/services`).then(res => setRequests(res.data)).catch(console.error);
        axios.get(`${API_URL}/posts`).then(res => setPosts(res.data)).catch(console.error);
    };

    useEffect(() => { fetchData(); }, []);

    const updateRequestStatus = (id, status) => {
        if (!window.confirm("Xác nhận đổi trạng thái?")) return;
        axios.put(`${API_URL}/services/${id}/status?status=${status}`).then(() => { alert("Đã cập nhật!"); fetchData(); });
    };

    const updatePayment = (id) => {
        if (!window.confirm("Xác nhận đã thanh toán?")) return;
        axios.put(`${API_URL}/services/${id}/payment`, { status: 'PAID' }).then(() => { alert("Đã xác nhận thanh toán!"); fetchData(); });
    };

    const decideFound = (id, found) => {
        const msg = found ? 'Xác nhận đã tìm thấy?' : 'Xác nhận KHÔNG tìm thấy?';
        if (!window.confirm(msg)) return;
        axios.put(`${API_URL}/services/${id}/decision?found=${found}`).then(() => {
            alert(found ? 'Đã đánh dấu là đã tìm thấy' : 'Đã đánh dấu là không tìm thấy');
            fetchData();
        }).catch(err => { console.error(err); alert('Lỗi khi cập nhật quyết định'); });
    };

    const openRefundModal = (req) => {
        // open modal to show requester info and perform refund
        setSelectedRequest(req);
        setShowRefundModal(true);
    };

    const [showRefundModal, setShowRefundModal] = useState(false);

    const refundRequest = (id) => {
        if (!window.confirm('Xác nhận hoàn tiền cho yêu cầu này?')) return;
        axios.put(`${API_URL}/services/${id}/refund`).then(() => {
            alert('Hoàn tiền thành công');
            setShowRefundModal(false);
            setSelectedRequest(null);
            fetchData();
        }).catch(err => { console.error(err); alert('Lỗi khi hoàn tiền'); });
    };

    const deletePost = (id) => {
        if (!window.confirm("Xóa bài viết?")) return;
        axios.delete(`${API_URL}/posts/${id}`).then(() => { alert("Đã xóa!"); fetchData(); });
    };

    const updatePostStatus = (id, status) => {
        axios.put(`${API_URL}/posts/${id}/status?status=${status}`).then(() => { alert("Đã cập nhật!"); fetchData(); });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-black text-gray-900">🛡️ Admin Dashboard</h2>
                    <div className="flex gap-2">
                        <Link
                            to="/admin/service-requests"
                            className="px-6 py-2 rounded-full font-bold text-sm transition-all bg-orange-600 text-white hover:bg-orange-700 shadow-lg"
                        >
                            💰 Quản lý thanh toán
                        </Link>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'requests' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                        >
                            🚑 Yêu cầu dịch vụ ({requests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'posts' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                        >
                            📝 Quản lý bài đăng ({posts.length})
                        </button>
                    </div>
                    <Link to="/" className="text-gray-500 hover:text-orange-600 font-bold transition-colors">Về trang chủ</Link>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {activeTab === 'requests' ? (
                                    <>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Liên hệ</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Khu vực</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Thanh toán</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Hành động</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Hình ảnh</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Tiêu đề</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Hành động</th>
                                    </>
                                )}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {activeTab === 'requests' ? (
                                requests.length === 0 ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-gray-500">Chưa có yêu cầu nào</td></tr>
                                ) : requests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-bold text-gray-900">#{req.id}</td>
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900">{req.contactName}</div>
                                            <div className="text-xs text-gray-500">{req.contactPhone}</div>
                                        </td>
                                        <td className="p-5 text-sm text-gray-600 max-w-xs truncate" title={req.petDescription}>{req.petDescription}</td>
                                        <td className="p-5 text-sm text-gray-600">{req.lastSeenLocation}</td>
                                        <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    req.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                        req.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                            'bg-green-100 text-green-700'
                                                }`}>
                                                    {req.status}
                                                </span>
                                        </td>
                                        <td className="p-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${req.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : req.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {req.paymentStatus || 'UNPAID'}
                                                    </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-2">
                                                <button onClick={() => setSelectedRequest(req)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-bold text-xs" title="Xem chi tiết">
                                                    <Eye size={16} />
                                                </button>

                                                {req.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => updateRequestStatus(req.id, 'PROCESSING')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-xs" title="Tiếp nhận">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button onClick={() => updateRequestStatus(req.id, 'CANCELLED')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-xs" title="Hủy yêu cầu">
                                                            Hủy
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'PROCESSING' && (
                                                    <>
                                                        {/* If payment not yet confirmed, allow manual completion as before */}
                                                        {req.paymentStatus !== 'PAID' ? (
                                                            <>
                                                                <button onClick={() => updateRequestStatus(req.id, 'COMPLETED')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold text-xs" title="Hoàn thành">
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button onClick={() => updateRequestStatus(req.id, 'CANCELLED')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-xs" title="Hủy yêu cầu">
                                                                    Hủy
                                                                </button>
                                                            </>
                                                        ) : (
                                                            /* If payment confirmed, show decision buttons */
                                                            <>
                                                                <button onClick={() => decideFound(req.id, true)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold text-xs" title="Đã tìm thấy">
                                                                    Đã tìm thấy
                                                                </button>
                                                                <button onClick={() => openRefundModal(req)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-xs" title="Chưa tìm thấy">
                                                                    Chưa tìm thấy
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {req.paymentStatus !== 'PAID' && (
                                                    <button onClick={() => updatePayment(req.id)} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 font-bold text-xs" title="Thu tiền">
                                                        <DollarSign size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))) : (
                                posts.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có bài đăng nào</td></tr>
                                ) : posts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-bold text-gray-900">#{post.id}</td>
                                        <td className="p-5">
                                            <img src={post.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop'} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="" />
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900 text-sm">{post.title}</div>
                                            <div className="text-xs text-gray-500">{post.location}</div>
                                        </td>
                                        <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${post.status === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {post.status === 'LOST' ? 'Thất lạc' : 'Đã thấy'}
                                                </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-2">
                                                <button onClick={() => setSelectedPost(post)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-bold text-xs">
                                                    <Eye size={16} />
                                                </button>
                                                {post.status === 'LOST' && (
                                                    <button onClick={() => updatePostStatus(post.id, 'FOUND')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold text-xs">
                                                        Đã thấy
                                                    </button>
                                                )}
                                                <button onClick={() => deletePost(post.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-xs">
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedRequest(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-black text-gray-900">Chi tiết yêu cầu #{selectedRequest.id}</h3>
                                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-full">×</button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <img
                                        src={selectedRequest.imageUrl || "https://via.placeholder.com/600"}
                                        alt="Pet"
                                        className="w-full h-64 object-cover rounded-2xl shadow-md bg-gray-100"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase">Người liên hệ</div>
                                        <div className="font-bold text-lg">{selectedRequest.contactName}</div>
                                        <div className="text-gray-600">{selectedRequest.contactPhone}</div>
                                        <div className="text-gray-600">{selectedRequest.contactEmail}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase">Khu vực</div>
                                        <div className="font-medium">{selectedRequest.lastSeenLocation}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase">Trạng thái</div>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                selectedRequest.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                    selectedRequest.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-green-100 text-green-700'
                                            }`}>
                                                {selectedRequest.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedRequest.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {selectedRequest.paymentStatus || 'UNPAID'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Thông tin chi tiết</div>
                                <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 whitespace-pre-line leading-relaxed">
                                    {selectedRequest.petDescription}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                                <button onClick={() => setSelectedRequest(null)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Đóng</button>
                                {selectedRequest.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => { updateRequestStatus(selectedRequest.id, 'PROCESSING'); setSelectedRequest(null); }} className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg">Tiếp nhận</button>
                                        <button onClick={() => { updateRequestStatus(selectedRequest.id, 'CANCELLED'); setSelectedRequest(null); }} className="px-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg">Hủy yêu cầu</button>
                                    </>
                                )}
                                {selectedRequest.paymentStatus === 'PAID' && selectedRequest.status !== 'COMPLETED' && (
                                    <>
                                        <button onClick={() => { decideFound(selectedRequest.id, true); setSelectedRequest(null); }} className="px-6 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg">Đã tìm thấy</button>
                                        {/* Open refund modal first; perform refund when admin confirms inside modal */}
                                        <button onClick={() => { setShowRefundModal(true); }} className="px-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg">Chưa tìm thấy</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRefundModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setShowRefundModal(false); setSelectedRequest(null); }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Hoàn tiền cho yêu cầu #{selectedRequest.id}</h3>
                            <button onClick={() => { setShowRefundModal(false); setSelectedRequest(null); }} className="text-gray-500">×</button>
                        </div>
                        <div className="mb-4">
                            <div className="text-xs text-gray-400 uppercase font-bold">Người liên hệ</div>
                            <div className="font-semibold">{selectedRequest.contactName}</div>
                            <div className="text-sm text-gray-600">{selectedRequest.contactPhone}</div>
                            {selectedRequest.contactEmail && <div className="text-sm text-gray-600">{selectedRequest.contactEmail}</div>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setShowRefundModal(false); setSelectedRequest(null); }} className="px-4 py-2 rounded-lg border">Hủy</button>
                            <button onClick={() => refundRequest(selectedRequest.id)} className="px-4 py-2 rounded-lg bg-red-600 text-white">Hoàn tiền</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedPost(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-black text-gray-900">Chi tiết bài đăng #{selectedPost.id}</h3>
                                <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 rounded-full">×</button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <img src={selectedPost.imageUrl || 'https://via.placeholder.com/600'} alt="" className="w-full h-64 object-cover rounded-2xl bg-gray-100" />
                                    <div className="mt-3 flex gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-700">{selectedPost.petType}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedPost.status === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {selectedPost.status === 'LOST' ? 'Thất lạc' : 'Đã thấy'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase">Tiêu đề</div>
                                        <div className="text-lg font-bold text-gray-900">{selectedPost.title}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase">Khu vực</div>
                                        <div className="text-gray-700">{selectedPost.location}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase">Mô tả</div>
                                        <div className="text-gray-700 whitespace-pre-line">{selectedPost.description}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Người đăng</div>
                                        {selectedPost.user ? (
                                            <div className="space-y-1 text-gray-700">
                                                <div className="font-semibold">{selectedPost.user.name}</div>
                                                <div className="text-sm text-gray-500">{selectedPost.user.email}</div>
                                                <div className="text-sm text-gray-500">{selectedPost.user.phone}</div>
                                                <div className="text-xs text-gray-400 uppercase font-bold">{selectedPost.user.role}</div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-sm">Chưa gán tài khoản</div>
                                        )}
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

export default AdminDashboard;