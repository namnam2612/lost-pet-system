import React from 'react';
import { PawPrint, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 font-sans mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
                            <div className="bg-orange-500 p-2 rounded-lg text-white">
                                <PawPrint size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">
                                Pet<span className="text-orange-500">Finder</span>.
                            </span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                            Chúng tôi là nền tảng kết nối cộng đồng yêu động vật lớn nhất Việt Nam. Sứ mệnh của chúng tôi là đảm bảo mọi thú cưng thất lạc đều tìm được đường trở về nhà an toàn.
                        </p>
                        <div className="flex gap-4">
                            <SocialButton><Facebook size={20} /></SocialButton>
                            <SocialButton><Instagram size={20} /></SocialButton>
                            <SocialButton><Twitter size={20} /></SocialButton>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Khám Phá</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/" text="Trang chủ" />
                            <FooterLink to="/request-service" text="Dịch vụ cứu hộ" />
                            <FooterLink to="/admin" text="Quản trị viên" />
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Liên Hệ</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={18} />
                                <span>Tầng 12, Tòa nhà Keangnam, Hà Nội</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-orange-500 flex-shrink-0" size={18} />
                                <span>1900 888 888</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-orange-500 flex-shrink-0" size={18} />
                                <span>hotro@petfinder.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; 2025 PetFinder Vietnam. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const SocialButton = ({ children }) => (
    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 cursor-pointer">
        {children}
    </div>
);

const FooterLink = ({ to, text }) => (
    <li>
        <Link to={to} className="group hover:text-orange-500 transition-colors flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
            {text}
        </Link>
    </li>
);

export default Footer;