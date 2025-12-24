import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, MapPin, Filter, ArrowRight } from 'lucide-react'
import { API_URL } from '../../api/config'
import Pagination from '../../components/Pagination'

const SearchPage = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ title: '', location: '', petType: '' })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const fetchPosts = () => {
        setLoading(true)
        const params = {}
        if (filters.title) params.title = filters.title
        if (filters.location) params.location = filters.location
        if (filters.petType) params.petType = filters.petType

        axios.get(`${API_URL}/blogs`, { params })
            .then(res => {
                const blogsData = Array.isArray(res.data) ? res.data.slice() : [];
                const mapped = blogsData.map(b => ({
                    id: b.id,
                    title: b.title || `${b.petType || ''} ${b.status || ''}`.trim(),
                    description: b.description || '',
                    location: b.location || '',
                    petType: b.petType || '',
                    status: b.status === 'FOUND' ? 'FOUND' : 'LOST',
                    imageUrl: b.imageUrl || '',
                    createdAt: b.createdAt || null,
                    source: 'blog'
                }));
                setPosts(mapped);
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false))
    }

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPosts = posts.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => { fetchPosts(); }, [])

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Tìm kiếm và xem tất cả bài viết</h2>
                        <p className="text-gray-500">Sử dụng bộ lọc để thu hẹp kết quả.</p>
                    </div>
                    <Link to="/" className="text-orange-600 font-bold">Trở về trang chủ</Link>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-8">
                    <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-transparent transition-all w-full">
                        <SearchIcon className="text-gray-400" size={20} />
                        <input type="text" placeholder="Tìm theo tên..." className="bg-transparent w-full outline-none text-gray-700 font-medium" name="title" value={filters.title} onChange={handleFilterChange} />
                    </div>
                    <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-transparent transition-all w-full">
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

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {currentPosts.map(post => (
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
                )}
                <Pagination
                    itemsPerPage={itemsPerPage}
                    totalItems={posts.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            </div>
        </div>
    )
}

export default SearchPage
