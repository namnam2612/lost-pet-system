import { useEffect, useState } from 'react'
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

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const fetchPosts = () => {
        setLoading(true);
        const params = {};
        if (filters.title) params.title = filters.title;
        if (filters.location) params.location = filters.location;
        if (filters.petType) params.petType = filters.petType;

        axios.get(`${API_URL}/posts`, { params })
            .then(res => { setPosts(res.data); setLoading(false); })
            .catch(() => {
                setPosts([
                    {id: 1, title: 'Lạc mất mèo Mun', location: 'Hà Nội', petType: 'CAT', status: 'LOST', description: 'Mèo đen, mắt vàng, lạc ở khu vực Thanh Xuân', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop'},
                    {id: 2, title: 'Tìm chó Corgi', location: 'TP.HCM', petType: 'DOG', status: 'LOST', description: 'Chó Corgi mông to, chân ngắn, lạc ở Quận 1', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop'},
                    {id: 3, title: 'Nhặt được chó Phốc', location: 'Đà Nẵng', petType: 'DOG', status: 'FOUND', description: 'Thấy em lang thang ở công viên', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1000&auto=format&fit=crop'}
                ]);
                setLoading(false);
            });
    }

    useEffect(() => { fetchPosts(); }, [])

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
                            Đưa thú cưng <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">trở về nhà.</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Nền tảng tìm kiếm thú cưng thất lạc số 1 Việt Nam. Kết nối sức mạnh cộng đồng để mỗi người bạn nhỏ đều được an toàn.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold shadow-xl transition-all transform hover:-translate-y-1 ${showForm ? 'bg-gray-200 text-gray-800' : 'bg-gray-900 text-white shadow-orange-200'}`}
                            >
                                {showForm ? <><XCircle size={20}/> Đóng Biểu Mẫu</> : <><PlusCircle size={20}/> Đăng Tin Ngay</>}
                            </button>
                            <Link to="/request-service" className="flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-full font-bold hover:border-orange-500 hover:text-orange-600 transition-all">
                                Dịch Vụ Cứu Hộ
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image Collage */}
                    <div className="hidden lg:block relative h-[500px]">
                        <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop" className="absolute top-0 right-10 w-72 h-96 object-cover rounded-[40px] shadow-2xl rotate-3 border-4 border-white z-10" alt="Dog"/>
                        <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop" className="absolute bottom-10 left-20 w-64 h-80 object-cover rounded-[40px] shadow-2xl -rotate-6 border-4 border-white" alt="Cat"/>
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

            {/* 3. THANH TÌM KIẾM */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    {/* ... (Giữ nguyên code thanh tìm kiếm) ... */}
                    <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-transparent focus-within:border-orange-500 transition-all w-full">
                        <Search className="text-gray-400" size={20} />
                        <input type="text" placeholder="Tìm theo tên..." className="bg-transparent w-full outline-none text-gray-700 font-medium" name="title" value={filters.title} onChange={handleFilterChange} />
                    </div>
                    <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-transparent focus-within:border-orange-500 transition-all w-full">
                        <MapPin className="text-gray-400" size={20} />
                        <input type="text" placeholder="Khu vực..." className="bg-transparent w-full outline-none text-gray-700 font-medium" name="location" value={filters.location} onChange={handleFilterChange} />
                    </div>
                    <div className="w-full md:w-48 relative">
                        <select className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:border-orange-500 border border-transparent appearance-none cursor-pointer font-medium" name="petType" value={filters.petType} onChange={handleFilterChange}>
                            <option value="">Tất cả loài</option>
                            <option value="DOG">🐶 Chó</option>
                            <option value="CAT">🐱 Mèo</option>
                        </select>
                        <Filter className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    <button className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-200" onClick={fetchPosts}>
                        Tìm kiếm
                    </button>
                </div>
            </div>

            {/* 4. DANH SÁCH BÀI VIẾT */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">Tin Mới Nhất</h2>
                    <Link to="/search" className="text-orange-600 font-bold hover:underline flex items-center gap-1">
                        Xem tất cả <ArrowRight size={16}/>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {posts.map(post => (
                            <div key={post.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="relative h-72 overflow-hidden">
                                    <Link to={`/posts/${post.id}`}>
                                        <img src={post.imageUrl || "https://via.placeholder.com/500"} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
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
                                        <Link to={`/posts/${post.id}`}>{post.title}</Link>
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                                        {post.description}
                                    </p>
                                    <Link to={`/posts/${post.id}`} className="w-full block text-center py-3 rounded-xl bg-gray-50 text-gray-900 font-bold text-sm hover:bg-black hover:text-white transition-all">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
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