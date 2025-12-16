import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, PlusCircle, XCircle, ArrowRight, Heart, ShieldCheck, Users } from 'lucide-react';
import PostForm from '../../components/PostForm';
import { API_URL } from '../../api/config';

const Home = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({ title: '', location: '', petType: '' });
    // carousel/pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const autoPlayRef = useRef(null);

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const fetchPosts = () => {
        setLoading(true);
        const params = {};
        if (filters.title) params.title = filters.title;
        if (filters.location) params.location = filters.location;
        if (filters.petType) params.petType = filters.petType;

        const postsReq = axios.get(`${API_URL}/posts`, { params }).catch(() => ({ data: [] }));
        const blogsReq = axios.get(`${API_URL}/blogs`).catch(() => ({ data: [] }));

        Promise.all([postsReq, blogsReq])
            .then(([postsRes, blogsRes]) => {
                const postsData = Array.isArray(postsRes.data) ? postsRes.data.slice() : [];
                const blogsData = Array.isArray(blogsRes.data) ? blogsRes.data.slice() : [];

                const mappedBlogs = blogsData.map(b => ({
                    id: b.blogId,
                    title: `${b.petType || ''} ${b.blogType || ''}`.trim(),
                    description: b.description || '',
                    location: b.province || '',
                    petType: b.petType || '',
                    status: b.blogStatus === 'FOUND' ? 'FOUND' : 'LOST',
                    imageUrl: b.imageUrl || '',
                    createdAt: b.createdAt || null,
                    source: 'blog'
                }));

                // Ensure posts have createdAt too; keep original fields for posts
                const normalizedPosts = postsData.map(p => ({ ...p, createdAt: p.createdAt || null, source: 'post' }));

                const combined = [...normalizedPosts, ...mappedBlogs];
                combined.sort((a, b) => {
                    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return tb - ta;
                });

                setPosts(combined.slice(0, 32));
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => { fetchPosts(); }, [])

    // carousel / autoplay settings
    const POSTS_PER_PAGE = 8;
    const MAX_PAGES = 4;
    const pages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE)));

    // reset page when posts change
    useEffect(() => {
        setCurrentPage(0);
    }, [posts.length]);

    // autoplay interval
    useEffect(() => {
        if (pages <= 1) return;
        autoPlayRef.current = setInterval(() => {
            setCurrentPage(prev => (prev + 1) % pages);
        }, 3000);
        return () => clearInterval(autoPlayRef.current);
    }, [pages]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* 1. HERO SECTION */}
            <div className="relative bg-white pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-50 rounded-l-[100px] opacity-60 pointer-events-none translate-x-1/3"></div>

                <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left z-10">
                        <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <Heart size={14} className="fill-orange-700" /> Cộng đồng yêu thương
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
                            Đưa thú cưng <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">trở về nhà.</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Nền tảng tìm kiếm thú cưng thất lạc số 1 Việt Nam. Kết nối sức mạnh cộng đồng để mỗi người bạn nhỏ đều được an toàn.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold shadow-xl transition-all transform hover:-translate-y-1 ${showForm ? 'bg-gray-200 text-gray-800' : 'bg-gray-900 text-white shadow-orange-200'}`}
                            >
                                {showForm ? <><XCircle size={20} /> Đóng Biểu Mẫu</> : <><PlusCircle size={20} /> Đăng Tin Ngay</>}
                            </button>
                            <Link to="/request-service" className="flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-full font-bold hover:border-orange-500 hover:text-orange-600 transition-all">
                                Dịch Vụ Cứu Hộ
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image Collage */}
                    <div className="hidden lg:block relative h-[500px]">
                        <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop" className="absolute top-0 right-10 w-72 h-96 object-cover rounded-[40px] shadow-2xl rotate-3 border-4 border-white z-10" alt="Dog" />
                        <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop" className="absolute bottom-10 left-20 w-64 h-80 object-cover rounded-[40px] shadow-2xl -rotate-6 border-4 border-white" alt="Cat" />
                    </div>
                </div>
            </div>

            {/* FORM ĐĂNG BÀI */}
            <div className={`transition-all duration-500 ease-in-out bg-white border-b border-gray-100 ${showForm ? 'max-h-[1200px] opacity-100 py-10' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="max-w-3xl mx-auto px-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <PostForm onPostCreated={() => { fetchPosts(); setShowForm(false); }} />
                    </div>
                </div>
            </div>

            {/* 2. STATS SECTION (Lấp đầy khoảng trống) */}
            <div className="bg-gray-900 py-16 text-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="p-4">
                        <div className="text-4xl font-black text-orange-500 mb-2">2.5K+</div>
                        <div className="text-sm text-gray-400 font-medium uppercase tracking-widest">Thú cưng được tìm thấy</div>
                    </div>
                    <div className="p-4">
                        <div className="text-4xl font-black text-orange-500 mb-2">10K+</div>
                        <div className="text-sm text-gray-400 font-medium uppercase tracking-widest">Thành viên hỗ trợ</div>
                    </div>
                    <div className="p-4">
                        <div className="text-4xl font-black text-orange-500 mb-2">24/7</div>
                        <div className="text-sm text-gray-400 font-medium uppercase tracking-widest">Hỗ trợ tìm kiếm</div>
                    </div>
                    <div className="p-4">
                        <div className="text-4xl font-black text-orange-500 mb-2">100%</div>
                        <div className="text-sm text-gray-400 font-medium uppercase tracking-widest">Miễn phí đăng tin</div>
                    </div>
                </div>
            </div>



            {/* 4. DANH SÁCH BÀI VIẾT */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">Tin Mới Nhất</h2>
                    <Link to="/search" className="text-orange-600 font-bold hover:underline flex items-center gap-1">
                        Xem tất cả <ArrowRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                ) : (
                    <div>
                        <div
                            className="relative overflow-hidden"
                            onMouseEnter={() => clearInterval(autoPlayRef.current)}
                            onMouseLeave={() => {
                                if (pages > 1) {
                                    autoPlayRef.current = setInterval(() => setCurrentPage(p => (p + 1) % pages), 3000);
                                }
                            }}
                        >
                            <div className="flex transition-transform duration-700 ease-in-out" style={{ width: `${pages * 100}%`, transform: `translateX(-${currentPage * (100 / pages)}%)` }}>
                                {Array.from({ length: pages }).map((_, pageIndex) => (
                                    <div key={pageIndex} style={{ width: `${100 / pages}%` }} className="px-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {posts.slice(pageIndex * POSTS_PER_PAGE, (pageIndex + 1) * POSTS_PER_PAGE).map(post => (
                                                <div key={post.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                                    <div className="relative h-72 overflow-hidden">
                                                        <Link to={`/${post.source === 'post' ? 'posts' : 'blogs'}/${post.id}`}>
                                                            <img src={post.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop"} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        </Link>
                                                        <div className="absolute top-4 left-4">
                                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg ${post.status === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}>
                                                                {post.status === 'LOST' ? 'Thất lạc' : 'Đã tìm thấy'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                                            <MapPin size={12} /> {post.location}
                                                        </div>
                                                        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                            <Link to={`/${post.source === 'post' ? 'posts' : 'blogs'}/${post.id}`}>{post.title}</Link>
                                                        </h3>
                                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                                                            {post.description}
                                                        </p>
                                                        <Link to={`/${post.source === 'post' ? 'posts' : 'blogs'}/${post.id}`} className="w-full block text-center py-3 rounded-xl bg-gray-50 text-gray-900 font-bold text-sm hover:bg-black hover:text-white transition-all">
                                                            Xem chi tiết
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-3 mt-6">
                                {Array.from({ length: pages }).map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i)} className={`w-3 h-3 rounded-full ${i === currentPage ? 'bg-orange-600' : 'bg-gray-300'}`} aria-label={`Go to page ${i + 1}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. HOW IT WORKS (Quy trình - Để lấp đầy trang) */}
            <div className="bg-white py-24 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Quy trình tìm kiếm</h2>
                        <p className="text-gray-500">Chúng tôi tối ưu hóa mọi bước để tăng cơ hội tìm thấy người bạn nhỏ của bạn.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500 transition-colors duration-300">
                                <PlusCircle size={32} className="text-orange-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">1. Đăng tin miễn phí</h3>
                            <p className="text-gray-500 leading-relaxed">Điền thông tin và hình ảnh thú cưng. Tin của bạn sẽ được hiển thị ngay lập tức.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                                <Users size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">2. Cộng đồng hỗ trợ</h3>
                            <p className="text-gray-500 leading-relaxed">Hàng ngàn tình nguyện viên và thành viên trong khu vực sẽ nhận được thông báo.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 transition-colors duration-300">
                                <ShieldCheck size={32} className="text-green-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">3. Xác minh & Đoàn tụ</h3>
                            <p className="text-gray-500 leading-relaxed">Nhận thông tin xác thực từ cộng đồng và đón thú cưng trở về nhà an toàn.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;