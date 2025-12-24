import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ArrowRight, Phone, User } from 'lucide-react';
import { API_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        setLoading(true);
        // Prefer blogs endpoint first; fall back to legacy posts if not found
        axios.get(`${API_URL}/blogs/${id}`)
            .then(res => {
                const b = res.data;
                console.log("Blog Detail Data:", b);
                const mapped = {
                    id: b.id,
                    title: b.title || `${b.petType || ''} ${b.status || ''}`.trim(),
                    description: b.description || '',
                    location: b.location || b.province || '',
                    petType: b.petType || '',
                    status: (b.blogStatus ? b.blogStatus : b.status) === 'FOUND' ? 'FOUND' : 'LOST',
                    imageUrl: b.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop',
                    user: b.user || null
                };
                setPost(mapped);
                setLoading(false);
            })
            .catch(() => {
                axios.get(`${API_URL}/posts/${id}`)
                    .then(res => {
                        const p = res.data;
                        const mapped = {
                            id: p.id,
                            title: p.title,
                            description: p.description || '',
                            location: p.location || '',
                            petType: p.petType || '',
                            status: p.status || 'LOST',
                            imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop',
                            user: p.user || null
                        };
                        setPost(mapped);
                        setLoading(false);
                    })
                    .catch(() => setLoading(false));
            });
    }, [id]);

    if (loading) return <div className="text-center mt-20">Đang tải dữ liệu...</div>;
    if (!post) return <div className="text-center mt-20">Không tìm thấy bài viết!</div>;

    const isOwner = currentUser && post.user && currentUser.id === post.user.id;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-8 font-medium transition-colors">
                    <ArrowRight className="rotate-180" size={20} /> Quay lại trang chủ
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        <div className="h-[400px] md:h-auto relative bg-gray-100">
                            <img src={post.imageUrl || "https://via.placeholder.com/600"} className="absolute inset-0 w-full h-full object-cover" alt={post.title} />
                        </div>
                        <div className="p-8 md:p-12">
                            <div className="flex gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${post.status === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}>
                                    {post.status === 'LOST' ? 'Thất lạc' : 'Đã tìm thấy'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                                    {post.petType}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">{post.title}</h1>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 font-bold uppercase">Khu vực</div>
                                        <div className="font-semibold text-gray-800">{post.location}</div>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-xl">
                                    <div className="text-xs text-gray-400 font-bold uppercase mb-2">Đặc điểm nhận dạng</div>
                                    <p className="text-gray-600 leading-relaxed">{post.description}</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                {isOwner ? (
                                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Đây là bài viết của bạn</h3>
                                        <p className="text-gray-600 text-sm mb-4">Bạn có thể chỉnh sửa hoặc xóa bài viết này trong phần quản lý.</p>
                                        <Link to="/my-posts" className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all">
                                            Quản lý bài viết
                                        </Link>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>
                                        {post.user ? (
                                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                        <User size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-gray-900">{post.user.name || 'Người dùng'}</div>
                                                        <div className="text-sm text-gray-500">Chủ bài đăng</div>
                                                    </div>
                                                </div>

                                                {post.user.phone ? (
                                                    <a href={`tel:${post.user.phone}`} className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all">
                                                        <Phone size={20} />
                                                        Gọi ngay: {post.user.phone}
                                                    </a>
                                                ) : (
                                                    <div className="text-center text-gray-500 py-2 bg-gray-50 rounded-xl">
                                                        Số điện thoại chưa được cung cấp
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-xl">Thông tin người đăng không khả dụng.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;