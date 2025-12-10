import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, Search, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const controlNavbar = () => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                setShow(false);
            } else {
                setShow(true);
            }
            setLastScrollY(window.scrollY);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className={`fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-transform duration-300 ease-in-out ${show ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-orange-500 to-red-500 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform">
                            <PawPrint size={24} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-800">
                            Pet<span className="text-orange-500">Finder</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100">
                        <NavLink to="/" label="Trang chủ" active={isActive('/')} />
                        <NavLink to="/search" label="Tìm thú cưng" active={isActive('/search')} />
                        <NavLink to="/request-service" label="Dịch vụ cứu hộ" active={isActive('/request-service')} />
                        {user && <NavLink to="/my-account" label="Tài khoản" active={isActive('/my-account')} />}
                        {user && <NavLink to="/my-posts" label="Bài của tôi" active={isActive('/my-posts')} />}
                        {user?.role?.toLowerCase() === 'admin' && <NavLink to="/admin" label="Admin" active={isActive('/admin')} />}
                    </div>

                    <div className="flex items-center gap-3">
                        {!user && (
                            <>
                                <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-full text-sm font-semibold border border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all">
                                    <User size={18} />
                                    <span>Đăng nhập</span>
                                </Link>
                                <Link to="/register" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold shadow-lg shadow-gray-300 hover:bg-gray-800 hover:-translate-y-0.5 transition-all">
                                    <span>Đăng ký</span>
                                </Link>
                            </>
                        )}
                        {user && (
                            <div className="hidden md:flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-full">{user.role?.toLowerCase() === 'admin' ? 'Admin' : 'User'}: {user.name || user.email}</span>
                                <button onClick={() => { logout(); navigate('/'); }} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        )}
                        <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end mb-8">
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6 text-lg font-bold text-gray-800">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
                            <Link to="/search" onClick={() => setMobileMenuOpen(false)}>Tìm thú cưng</Link>
                            <Link to="/request-service" onClick={() => setMobileMenuOpen(false)}>Dịch vụ cứu hộ</Link>
                            {user && <Link to="/my-account" onClick={() => setMobileMenuOpen(false)}>Tài khoản</Link>}
                            {user && <Link to="/my-posts" onClick={() => setMobileMenuOpen(false)}>Bài của tôi</Link>}
                            {user?.role?.toLowerCase() === 'admin' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>}
                            {!user && (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Đăng ký</Link>
                                </>
                            )}
                            {user && (
                                <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                                    className="text-left text-red-600 font-semibold"
                                >
                                    Đăng xuất
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const NavLink = ({ to, label, active }) => (
    <Link to={to} className={`px-6 py-2.5 rounded-full transition-all text-sm font-medium ${active ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
        {label}
    </Link>
);

export default Navbar;