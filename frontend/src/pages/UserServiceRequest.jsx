import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../api/config';

const UserServiceRequest = () => {
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({
        contactName: '',
        contactPhone: '',
        petDescription: '',
        lastSeenLocation: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('pf_auth_user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            setFormData(prev => ({ ...prev, contactName: u.name, contactPhone: u.phone }));
            fetchRequests(u.id);
        }
    }, []);

    const fetchRequests = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}/services/user/${userId}`);
            setRequests(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/upload`, data);
            if (field === 'imageUrl') {
                setFormData(prev => ({ ...prev, imageUrl: res.data }));
            } else if (field === 'bill') {
                // Handle bill upload separately in the list
            }
        } catch (error) {
            alert('Lỗi upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Vui lòng đăng nhập");
        setLoading(true);
        try {
            await axios.post(`${API_URL}/services`, {
                ...formData,
                user: { id: user.id }
            });
            alert("Gửi yêu cầu thành công! Vui lòng thanh toán để admin duyệt.");
            setFormData({ ...formData, petDescription: '', lastSeenLocation: '', imageUrl: '' });
            fetchRequests(user.id);
        } catch (error) {
            alert("Lỗi khi gửi yêu cầu");
        } finally {
            setLoading(false);
        }
    };

    const handleBillUpload = async (requestId, file) => {
        if (!file) return;
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/upload`, data);
            await axios.put(`${API_URL}/services/${requestId}/payment`, {
                billImageUrl: res.data
            });
            alert("Đã gửi ảnh bill! Chờ admin xác nhận.");
            fetchRequests(user.id);
        } catch (error) {
            alert("Lỗi khi gửi bill");
        }
    };

    if (!user) return <div className="p-10 text-center">Vui lòng <Link to="/login" className="text-blue-600 font-bold">đăng nhập</Link> để sử dụng dịch vụ.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Dịch vụ tìm kiếm thú cưng</h1>

            {/* Form tạo request */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-10">
                <h2 className="text-xl font-bold mb-4">1. Gửi yêu cầu mới</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input className="p-3 border rounded-xl" placeholder="Tên liên hệ" name="contactName" value={formData.contactName} onChange={handleInputChange} required />
                        <input className="p-3 border rounded-xl" placeholder="Số điện thoại" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} required />
                    </div>
                    <input className="w-full p-3 border rounded-xl" placeholder="Địa điểm thất lạc" name="lastSeenLocation" value={formData.lastSeenLocation} onChange={handleInputChange} required />
                    <textarea className="w-full p-3 border rounded-xl" placeholder="Mô tả thú cưng (Loài, màu sắc, đặc điểm...)" name="petDescription" value={formData.petDescription} onChange={handleInputChange} required rows="3"></textarea>

                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
                            📸 Chọn ảnh thú cưng
                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                        </label>
                        {formData.imageUrl && <span className="text-green-600 text-sm">✓ Đã tải ảnh</span>}
                    </div>

                    <button disabled={loading || uploading} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50">
                        {loading ? "Đang gửi..." : "Gửi Yêu Cầu (Phí: 500.000đ)"}
                    </button>
                </form>
            </div>

            {/* Danh sách request */}
            <h2 className="text-xl font-bold mb-4">2. Lịch sử yêu cầu</h2>
            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/4">
                            <img src={req.imageUrl || "https://via.placeholder.com/150"} alt="Pet" className="w-full h-32 object-cover rounded-lg bg-gray-100" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">Yêu cầu #{req.id}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                    req.status === 'FOUND' ? 'bg-green-100 text-green-700' :
                                        req.status === 'NOT_FOUND' ? 'bg-orange-100 text-orange-700' :
                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>{req.status === 'PROCESSING' ? 'Đang tìm kiếm' : req.status === 'FOUND' ? 'Đã tìm thấy' : req.status === 'NOT_FOUND' ? 'Không tìm thấy' : req.status === 'REJECTED' ? 'Từ chối' : req.status === 'CREATED' ? 'Mới tạo' : req.status}</span>
                            </div>
                            <p className="text-gray-600 text-sm">{req.petDescription}</p>
                            <p className="text-gray-500 text-xs">📍 {req.lastSeenLocation}</p>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Trạng thái thanh toán: </span>
                                        <span className={`ml-2 font-bold ${req.paymentStatus === 'PAID' ? 'text-green-600' :
                                            req.paymentStatus === 'PENDING_VERIFICATION' ? 'text-blue-600' :
                                                'text-red-500'
                                            }`}>
                                            {req.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                                                req.paymentStatus === 'PENDING_VERIFICATION' ? 'Đang chờ xác thực' :
                                                    'Chưa thanh toán'}
                                        </span>
                                    </div>

                                    {/* Nút upload bill nếu chưa thanh toán hoặc bị từ chối */}
                                    {(req.paymentStatus === 'UNPAID' || req.paymentStatus === 'PAYMENT_INVALID' || !req.paymentStatus) && (
                                        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                                            📤 {req.billImageUrl ? "Gửi lại Bill" : "Thanh toán & Gửi Bill"}
                                            <input type="file" className="hidden" onChange={(e) => handleBillUpload(req.id, e.target.files[0])} />
                                        </label>
                                    )}
                                </div>
                                {req.status === 'PAYMENT_INVALID' && (
                                    <p className="text-red-500 text-xs mt-2">⚠️ Bill trước đó không hợp lệ. Vui lòng kiểm tra và gửi lại.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {requests.length === 0 && <p className="text-gray-500 text-center">Chưa có yêu cầu nào.</p>}
            </div>
        </div>
    );
};

export default UserServiceRequest;