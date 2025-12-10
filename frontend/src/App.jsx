import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/user/Home';
import PostDetail from './pages/user/PostDetail';
import ServiceRequest from './pages/user/ServiceRequest';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyPosts from './pages/user/MyPosts';
import MyAccount from './pages/user/MyAccount';
import { useAuth } from './context/AuthContext';

const RequireAdmin = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    if (user?.role?.toLowerCase() !== 'admin') {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return children;
};

const RequireUser = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    if (!user?.id) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/posts/:id" element={<PostDetail />} />
                        <Route path="/request-service" element={<ServiceRequest />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/my-posts"
                            element={
                                <RequireUser>
                                    <MyPosts />
                                </RequireUser>
                            }
                        />
                        <Route
                            path="/my-account"
                            element={
                                <RequireUser>
                                    <MyAccount />
                                </RequireUser>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <RequireAdmin>
                                    <AdminDashboard />
                                </RequireAdmin>
                            }
                        />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;