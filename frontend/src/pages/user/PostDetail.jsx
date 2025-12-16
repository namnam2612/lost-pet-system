import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ArrowRight, Phone } from 'lucide-react';
import { API_URL } from '../../api/config';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Prefer blogs endpoint first; fall back to legacy posts if not found
        axios.get(`${API_URL}/blogs/${id}`)
            .then(res => {
                const b = res.data;
                const mapped = {
                    id: b.id,
                    title: b.title || `${b.petType || ''} ${b.status || ''}`.trim(),
                    description: b.description || '',
                    location: b.location || '',
                    petType: b.petType || '',
                    status: b.status === 'FOUND' ? 'FOUND' : 'LOST',
                    imageUrl: b.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop'
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
                            imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop'
                        };
                        setPost(mapped);
                        setLoading(false);
                    })
                    .catch(() => setLoading(false));
            });
    }, [id]);

    if (loading) return <div className="text-center mt-20">Đang tải dữ liệu...</div>;
    if (!post) return <div className="text-center mt-20">Không tìm thấy bài viết!</div>;

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

                            <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2" onClick={() => alert("Chức năng liên hệ đang phát triển!")}>
                                <Phone size={20} /> Liên hệ chủ nuôi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;