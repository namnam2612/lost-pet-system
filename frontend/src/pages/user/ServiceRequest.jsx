import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { API_URL } from '../../api/config';

const ServiceRequest = () => {
    const [formData, setFormData] = useState({
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        petName: '',
        petType: 'DOG',
        lostDate: '',
        petDescription: '',
        lastSeenLocation: '',
        imageUrl: ''
    });
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        axios.post(`${API_URL}/upload`, uploadData)
            .then(res => {
                setFormData({ ...formData, imageUrl: res.data });
                setUploading(false);
            })
            .catch(() => {
                alert("Lỗi upload ảnh");
                setUploading(false);
            });
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();

        const submitData = {
            contactName: formData.contactName,
            contactPhone: formData.contactPhone,
            lastSeenLocation: formData.lastSeenLocation,
            imageUrl: formData.imageUrl,
            petDescription: `[${formData.petType}] Tên thú cưng: ${formData.petName} | Ngày thất lạc: ${formData.lostDate} | Email liên hệ: ${formData.contactEmail} \n\n Đặc điểm chi tiết: ${formData.petDescription}`
        };

        axios.post(`${API_URL}/search-requests`, submitData)
            .then(() => {
                alert("Đã gửi yêu cầu thành công! Đội cứu hộ sẽ liên hệ bạn sớm.");
                setFormData({
                    contactName: '', contactPhone: '', contactEmail: '',
                    petName: '', petType: 'DOG', lostDate: '',
                    petDescription: '', lastSeenLocation: '', imageUrl: ''
                });
            })
            .catch(() => alert("Lỗi khi gửi yêu cầu!"));
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-8 font-medium transition-colors">
                    <ArrowRight className="rotate-180" size={20} /> Quay lại trang chủ
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-gray-900 p-8 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">Dịch Vụ Cứu Hộ</h2>
                        <p className="text-gray-400">Đội ngũ chuyên nghiệp sẽ hỗ trợ bạn tìm kiếm trong 24h</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">1</span>
                                    Thông tin liên hệ
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên bạn</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none" name="contactName" value={formData.contactName} onChange={handleChange} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Để nhận thông báo)</label>
                                        <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="example@gmail.com" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">2</span>
                                    Thông tin thú cưng
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên thú cưng</label>
                                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none" name="petName" value={formData.petName} onChange={handleChange} placeholder="VD: Miu, Lu..." required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none cursor-pointer" name="petType" value={formData.petType} onChange={handleChange}>
                                                <option value="DOG">Chó</option>
                                                <option value="CAT">Mèo</option>
                                                <option value="OTHER">Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian thất lạc</label>
                                            <input type="datetime-local" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none" name="lostDate" value={formData.lostDate} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực nhìn thấy lần cuối</label>
                                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none" name="lastSeenLocation" value={formData.lastSeenLocation} onChange={handleChange} placeholder="Số nhà, đường, quận..." required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh nhận dạng</label>
                                        <input type="file" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" onChange={handleFileChange} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả đặc điểm chi tiết</label>
                                        <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none min-h-[100px]" name="petDescription" value={formData.petDescription} onChange={handleChange} placeholder="Màu lông, giống loài, cân nặng, đặc điểm riêng..." required></textarea>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2" disabled={uploading}>
                                {uploading ? 'Đang tải ảnh...' : <>🚀 GỬI YÊU CẦU NGAY</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequest;
