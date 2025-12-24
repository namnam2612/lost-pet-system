import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Edit, Trash, PlusCircle, MapPin } from 'lucide-react';
import Pagination from '../../components/Pagination';

const MyPosts = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', location: '', petType: 'DOG', imageUrl: '', status: 'LOST' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    const canAccess = useMemo(() => !!user?.id, [user]);

    const fetchPosts = () => {
        if (!user?.id) return;
        setLoading(true);
        axios.get(`${API_URL}/blogs/user/${user.id}`)
            .then(res => {
                // map BlogListResponse to the shape expected by this component
                const mapped = res.data.map(b => ({
                    id: b.id,
                    title: b.title || `${b.petType ? b.petType + ' ' : ''}${b.status || ''}`.trim(),
                    description: b.description || '',
                    location: b.location || '',
                    petType: b.petType || 'DOG',
                    imageUrl: b.imageUrl || '',
                    status: b.status || 'LOST'
                }));
                setPosts(mapped);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPosts(); }, [user?.id]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPosts = posts.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const startEdit = (post) => {
        setEditingPost(post);
        setForm({
            title: post.title || '',
            description: post.description || '',
            location: post.location || '',
            petType: post.petType || 'DOG',
            imageUrl: post.imageUrl || '',
            status: post.status || 'LOST'
        });
    };

    const saveEdit = () => {
        if (!editingPost) return;
        const payload = {
            petType: form.petType,
            description: form.description,
            imageUrl: form.imageUrl,
            location: form.location,
            status: form.status
        };

        axios.put(`${API_URL}/blogs/${editingPost.id}?userId=${user.id}`, payload)
            .then(() => {
                setEditingPost(null);
                fetchPosts();
            })
            .catch(() => alert("Lỗi khi cập nhật bài viết"));
    };

    const deletePost = (id) => {
        if (!window.confirm("Xóa bài này?")) return;
        axios.delete(`${API_URL}/blogs/${id}?userId=${user.id}`)
            .then(fetchPosts)
            .catch(() => alert("Lỗi khi xóa bài viết"));
    };

    if (!canAccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center space-y-4">
                    <p className="text-gray-700 font-semibold">Vui lòng đăng nhập để quản lý bài đăng.</p>
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
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Bài đăng của tôi</h2>
                        <p className="text-gray-500">Quản lý, chỉnh sửa hoặc xóa các bài bạn đã đăng.</p>
                    </div>
                    <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white font-semibold shadow hover:bg-black">
                        <PlusCircle size={18} /> Đăng bài mới
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-500">Đang tải...</div>
                ) : posts.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl shadow text-center text-gray-500">Bạn chưa có bài đăng nào.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentPosts.map(post => (
                            <div key={post.id} className="bg-white rounded-2xl shadow border border-gray-100 p-5 space-y-3">
                                <div className="flex gap-3">
                                    <img src={post.imageUrl || 'https://via.placeholder.com/120'} alt="" className="w-28 h-28 object-cover rounded-xl bg-gray-100" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">{post.petType}</span>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${post.status === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {post.status === 'LOST' ? 'Thất lạc' : 'Đã thấy'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{post.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                            <MapPin size={14} /> {post.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(post)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100">
                                        <Edit size={16} /> Sửa
                                    </button>
                                    <button onClick={() => deletePost(post.id)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100">
                                        <Trash size={16} /> Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Pagination
                    itemsPerPage={itemsPerPage}
                    totalItems={posts.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            </div>

            {editingPost && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setEditingPost(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Chỉnh sửa bài #{editingPost.id}</h3>
                            <button onClick={() => setEditingPost(null)} className="text-gray-500 hover:text-black">×</button>
                        </div>
                        <div className="space-y-4">
                            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Tiêu đề" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Khu vực" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.petType} onChange={e => setForm({ ...form, petType: e.target.value })}>
                                <option value="DOG">Chó</option>
                                <option value="CAT">Mèo</option>
                                <option value="OTHER">Khác</option>
                            </select>
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="LOST">Thất lạc</option>
                                <option value="FOUND">Đã thấy</option>
                            </select>
                            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Link ảnh" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                            <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[120px]" placeholder="Mô tả" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingPost(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600">Hủy</button>
                                <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold">Lưu</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPosts;
