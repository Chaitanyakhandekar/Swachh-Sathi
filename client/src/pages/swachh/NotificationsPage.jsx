import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notification.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { 
    Bell, Check, CheckCheck, Trash2, Calendar, Award, Users, AlertCircle, 
    Clock, Sparkles, Filter, RefreshCw, CheckCircle, XCircle, Info
} from 'lucide-react';

const NotificationsPage = () => {
    const { user } = useContext(authContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        const params = filter === 'unread' ? { unreadOnly: 'true' } : {};
        const result = await notificationApi.getNotifications(params);
        if (result.success) {
            setNotifications(result.data.notifications || []);
            setUnreadCount(result.data.unreadCount || 0);
        }
        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
        toast.success('Notifications refreshed');
    };

    const handleMarkAsRead = async (notificationId) => {
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

    const handleDelete = async (notificationId) => {
        const result = await notificationApi.deleteNotification(notificationId);
        if (result.success) {
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success('Notification deleted');
        }
    };

    const handleDeleteAllRead = async () => {
        const result = await notificationApi.deleteAllRead();
        if (result.success) {
            setNotifications(prev => prev.filter(n => !n.isRead));
            toast.success(`${result.data.deleted} notifications cleared`);
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
    };

    const getNotificationStyle = (type) => {
        const styles = {
            EVENT_JOINED: { 
                gradient: 'from-blue-500 to-cyan-600', 
                bg: 'bg-blue-500/10', 
                border: 'border-blue-500/20',
                icon: Users,
                label: 'New Volunteer'
            },
            EVENT_COMPLETED: { 
                gradient: 'from-green-500 to-emerald-600', 
                bg: 'bg-green-500/10', 
                border: 'border-green-500/20',
                icon: CheckCircle,
                label: 'Event Completed'
            },
            EVENT_CANCELLED: { 
                gradient: 'from-red-500 to-rose-600', 
                bg: 'bg-red-500/10', 
                border: 'border-red-500/20',
                icon: XCircle,
                label: 'Event Cancelled'
            },
            CREDITS_EARNED: { 
                gradient: 'from-amber-500 to-orange-600', 
                bg: 'bg-amber-500/10', 
                border: 'border-amber-500/20',
                icon: Award,
                label: 'Credits Earned'
            },
            ATTENDANCE_MARKED: { 
                gradient: 'from-green-500 to-teal-600', 
                bg: 'bg-green-500/10', 
                border: 'border-green-500/20',
                icon: CheckCheck,
                label: 'Attendance'
            },
            NEW_EVENT: { 
                gradient: 'from-purple-500 to-violet-600', 
                bg: 'bg-purple-500/10', 
                border: 'border-purple-500/20',
                icon: Calendar,
                label: 'New Event'
            },
            EVENT_REMINDER: { 
                gradient: 'from-orange-500 to-amber-600', 
                bg: 'bg-orange-500/10', 
                border: 'border-orange-500/20',
                icon: Clock,
                label: 'Reminder'
            },
            SYSTEM: { 
                gradient: 'from-gray-500 to-slate-600', 
                bg: 'bg-gray-500/10', 
                border: 'border-gray-500/20',
                icon: Info,
                label: 'System'
            }
        };
        return styles[type] || styles.SYSTEM;
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} days ago`;
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Bell size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                                <p className="text-gray-400">
                                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all border border-white/10"
                        >
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
                            >
                                <CheckCheck size={18} />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 p-1.5 bg-[#13151c] rounded-xl border border-white/5">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filter === 'all' 
                                    ? 'bg-white/10 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                filter === 'unread' 
                                    ? 'bg-white/10 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="flex-1"></div>
                    <button
                        onClick={handleDeleteAllRead}
                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 transition-all text-sm"
                    >
                        <Trash2 size={16} />
                        Clear read
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border border-blue-500/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{notifications.filter(n => n.type === 'EVENT_JOINED').length}</p>
                                <p className="text-sm text-gray-400">New Volunteers</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Award size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{notifications.filter(n => n.type === 'CREDITS_EARNED').length}</p>
                                <p className="text-sm text-gray-400">Credits Earned</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{notifications.filter(n => n.type === 'EVENT_COMPLETED').length}</p>
                                <p className="text-sm text-gray-400">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/5 border border-purple-500/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Calendar size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{notifications.filter(n => n.type === 'NEW_EVENT').length}</p>
                                <p className="text-sm text-gray-400">New Events</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-[#13151c] border border-white/5 rounded-2xl p-6 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-16 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center">
                            <Bell size={48} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            {filter === 'unread' 
                                ? "You've read all your notifications. Great job!" 
                                : "When you join events or receive updates, they'll show up here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification, index) => {
                            const style = getNotificationStyle(notification.type);
                            const Icon = style.icon;
                            return (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group relative bg-[#13151c] border rounded-2xl p-5 hover:scale-[1.01] cursor-pointer transition-all duration-200 ${
                                        !notification.isRead 
                                            ? 'border-l-4 border-l-green-500 border-white/10' 
                                            : 'border-white/5 hover:border-green-500/30'
                                    }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg`}>
                                            <Icon size={24} className="text-white" />
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${style.bg} ${style.border} border`}>
                                                        {style.label}
                                                    </span>
                                                    <p className={`text-base mt-2 ${!notification.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                        {notification.content}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {getTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification._id);
                                                    }}
                                                    className="p-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification._id);
                                                }}
                                                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationsPage;