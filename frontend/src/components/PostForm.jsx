import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const PostForm = ({ onPostCreated }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '', description: '', location: '', petType: 'DOG', imageUrl: ''
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
                alert("Lỗi upload ảnh (Backend chưa chạy hoặc chưa cấu hình?)");
                setUploading(false);
            });
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user?.id) {
            alert("Vui lòng đăng nhập để đăng tin.");
            return;
        }

        const payload = {
            title: formData.title,
            blogType: 'LOST',
            petType: formData.petType,
            description: formData.description,
            imageUrl: formData.imageUrl,
            location: formData.location,
            userId: user.id
        };

        axios.post(`${API_URL}/blogs`, payload)
            .then(() => {
                alert("Đăng bài thành công!");
                setFormData({ title: '', description: '', location: '', petType: 'DOG', imageUrl: '' });
                if (onPostCreated) onPostCreated();
            })
            .catch(() => alert("Lỗi khi đăng bài!"));
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Thông tin thú cưng</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề tin</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 focus:bg-white transition-all outline-none" name="title" value={formData.title} onChange={handleChange} placeholder="VD: Tìm chó Poodle lạc..." required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực thất lạc</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 focus:bg-white transition-all outline-none" name="location" value={formData.location} onChange={handleChange} placeholder="Quận/Huyện, Tỉnh/TP..." required />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại thú cưng</label>
                        <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 focus:bg-white transition-all outline-none cursor-pointer" name="petType" value={formData.petType} onChange={handleChange}>
                            <option value="DOG">Chó</option>
                            <option value="CAT">Mèo</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                        <input type="file" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" onChange={handleFileChange} />
                        {uploading && <p className="text-xs text-orange-500 mt-1">Đang tải ảnh...</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                    <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:border-orange-500 focus:bg-white transition-all outline-none min-h-[120px]" name="description" value={formData.description} onChange={handleChange} placeholder="Màu lông, đặc điểm nhận dạng, vòng cổ..." required></textarea>
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50" disabled={uploading}>
                    {uploading ? 'Đang xử lý...' : 'Đăng Tin Ngay'}
                </button>
            </form>
        </div>
    );
};

export default PostForm;