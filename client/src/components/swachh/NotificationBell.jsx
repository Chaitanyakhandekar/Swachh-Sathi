import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notification.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import toast from 'react-hot-toast';
import { Bell, Check, CheckCheck, X, Trash2, Calendar, Award, Users, AlertCircle, Clock, Sparkles } from 'lucide-react';

const NotificationBell = () => {
    const { user } = useContext(authContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 15000);
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (unreadCount > 0) {
            setAnimate(true);
            const timeout = setTimeout(() => setAnimate(false), 1000);
            return () => clearTimeout(timeout);
        }
    }, [unreadCount]);

    const fetchNotifications = async () => {
        const result = await notificationApi.getNotifications({ limit: 5 });
        if (result.success) {
            setNotifications(result.data.notifications || []);
        }
    };

    const fetchUnreadCount = async () => {
        const result = await notificationApi.getUnreadCount();
        if (result.success) {
            setUnreadCount(result.data.count || 0);
        }
    };

    const handleMarkAsRead = async (notificationId, e) => {
        e?.stopPropagation();
        const result = await notificationApi.markAsRead(notificationId);
        if (result.success) {
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        const result = await notificationApi.markAllAsRead();
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        }
    };

    const handleDelete = async (notificationId, e) => {
        e?.stopPropagation();
        const result = await notificationApi.deleteNotification(notificationId);
        if (result.success) {
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
        if (notification.renderUrl) {
            navigate(notification.renderUrl);
        } else if (notification.entity) {
            navigate(`/event/${notification.entity}`);
        }
        setIsOpen(false);
    };

    const getNotificationStyle = (type) => {
        const styles = {
            EVENT_JOINED: { bg: 'bg-gradient-to-br from-blue-500 to-cyan-600', icon: Users, glow: 'shadow-blue-500/50' },
            EVENT_COMPLETED: { bg: 'bg-gradient-to-br from-green-500 to-emerald-600', icon: Check, glow: 'shadow-green-500/50' },
            EVENT_CANCELLED: { bg: 'bg-gradient-to-br from-red-500 to-rose-600', icon: X, glow: 'shadow-red-500/50' },
            CREDITS_EARNED: { bg: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: Award, glow: 'shadow-amber-500/50' },
            ATTENDANCE_MARKED: { bg: 'bg-gradient-to-br from-green-500 to-teal-600', icon: CheckCheck, glow: 'shadow-green-500/50' },
            NEW_EVENT: { bg: 'bg-gradient-to-br from-purple-500 to-violet-600', icon: Calendar, glow: 'shadow-purple-500/50' },
            EVENT_REMINDER: { bg: 'bg-gradient-to-br from-orange-500 to-amber-600', icon: Clock, glow: 'shadow-orange-500/50' },
            SYSTEM: { bg: 'bg-gradient-to-br from-gray-500 to-slate-600', icon: AlertCircle, glow: 'shadow-gray-500/50' }
        };
        return styles[type] || styles.SYSTEM;
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-3 rounded-2xl transition-all duration-300 ${
                    isOpen 
                        ? 'bg-green-500/20 scale-110' 
                        : 'hover:bg-white/10 hover:scale-105'
                }`}
            >
                <div className="relative">
                    <Bell size={22} className={`transition-all duration-300 ${isOpen ? 'text-green-400' : 'text-gray-300'}`} />
                    {unreadCount > 0 && (
                        <span className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50 ${animate ? 'scale-125' : 'scale-100'}`}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
                {/* Glow effect */}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute inset-0 rounded-2xl bg-green-500/20 blur-lg -z-10"></span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="fixed left-[260px] top-4 w-[90vw] max-w-[380px] max-h-[calc(100vh-40px)] bg-[#0f1117] rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[100]">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <Bell size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Notifications</h3>
                                    <p className="text-xs text-gray-400">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="p-2 rounded-xl hover:bg-white/10 transition-all group"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={18} className="text-gray-400 group-hover:text-green-400 transition-colors" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center">
                                    <Bell size={32} className="text-gray-500" />
                                </div>
                                <p className="text-gray-400 font-medium">No notifications yet</p>
                                <p className="text-gray-500 text-sm mt-1">Join events to stay updated</p>
                            </div>
                        ) : (
                            notifications.map((notification, index) => {
                                const style = getNotificationStyle(notification.type);
                                const Icon = style.icon;
                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`group relative px-5 py-4 hover:bg-white/5 cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0 ${
                                            !notification.isRead ? 'bg-gradient-to-r from-green-500/5 to-transparent' : ''
                                        }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Unread indicator */}
                                        {!notification.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500 rounded-l"></div>
                                        )}
                                        
                                        <div className="flex items-start gap-4">
                                            <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center shadow-lg ${style.glow}`}>
                                                <Icon size={20} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm leading-snug ${!notification.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                        {notification.content}
                                                    </p>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {getTimeAgo(notification.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} className="text-green-400" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(notification._id, e)}
                                                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-gradient-to-r from-transparent via-green-500/5 to-transparent border-t border-white/5">
                        <button
                            onClick={() => {
                                navigate('/notifications');
                                setIsOpen(false);
                            }}
                            className="w-full py-2.5 text-sm font-medium text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} />
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;