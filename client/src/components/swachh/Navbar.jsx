import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authContext } from '../../context/AuthProvider.jsx';
import { userAuthStore } from '../../store/userStore.js';
import { userApi } from '../../api/user.api.js';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell.jsx';
import {
  Home,
  MapPin,
  Trophy,
  User,
  PlusCircle,
  Calendar,
  LogOut,
  Menu,
  X,
  Award,
  BarChart3,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, setUser } = useContext(authContext);
  const setStoreUser = userAuthStore().setUser;
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    const result = await userApi.logoutUser();
    if (result.success) {
      setUser(null);
      setStoreUser(null);
      toast.success("Logged out successfully");
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/nearby", icon: MapPin, label: "Nearby Events" },
    { to: "/my-events", icon: Calendar, label: "My Events" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-[#0a0b0f]/95 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-white font-semibold">Swachh Sathi</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-400 hover:text-white">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="bg-[#0a0b0f] border-t border-white/5 p-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(link.to)
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            ))}
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <Link
                to="/create-event"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
              >
                <PlusCircle size={20} />
                <span>Create Event</span>
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Shield size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#0a0b0f]/95 backdrop-blur-xl border-r border-white/5 z-40">
        {/* Logo */}
        <div className="p-6">
          <Link to="/home" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <span className="text-white font-bold">SS</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Swachh Sathi</h1>
                <p className="text-gray-500 text-xs">Clean India Movement</p>
              </div>
            </div>
            <NotificationBell />
          </Link>
        </div>

        {/* User Info */}
        <div className="mx-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/10">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user?.username} className="w-10 h-10 rounded-full border-2 border-green-500/30" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-green-400 text-sm font-medium">⭐ {user?.credits || 0} Credits</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
              {user?.role}
            </span>
            {user?.city && (
              <span className="text-xs text-gray-500 truncate">📍 {user.city}</span>
            )}
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #0a0b0f' }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(link.to)
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-600/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}

          {/* Organizer Section */}
          {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizer</p>
              </div>
              <Link
                to="/create-event"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive("/create-event")
                    ? "bg-green-500/20 text-green-400 border border-green-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <PlusCircle size={20} />
                <span className="font-medium">Create Event</span>
              </Link>
            </>
          )}

          {/* Admin Section */}
          {user?.role === 'ADMIN' && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
              </div>
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive("/admin")
                    ? "bg-green-500/20 text-green-400 border border-green-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Shield size={20} />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* Profile & Logout - Fixed at bottom */}
        <div className="p-4 border-t border-white/5">
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
              isActive("/profile")
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User size={20} />
            <span className="font-medium">Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;