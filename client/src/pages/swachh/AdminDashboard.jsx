import { useState, useEffect, useContext } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, XCircle, BarChart3, Users, Calendar, Award, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    const [stats, setStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyModal, setVerifyModal] = useState({ open: false, eventId: '', status: '' });
    const [eventId, setEventId] = useState('');

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            toast.error('Admin access required');
            navigate('/home');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        const [statsResult, leaderboardResult] = await Promise.all([
            adminApi.getStats(),
            adminApi.getLeaderboard({ limit: 10 })
        ]);
        if (statsResult.success) setStats(statsResult.data);
        if (leaderboardResult.success) setLeaderboard(leaderboardResult.data);
        setLoading(false);
    };

    const handleVerifyEvent = async () => {
        if (!eventId || !verifyModal.status) {
            toast.error('Event ID and status are required');
            return;
        }
        const result = await adminApi.verifyEventCompletion({
            eventId,
            status: verifyModal.status
        });
        if (result.success) {
            toast.success(result.message);
            setVerifyModal({ open: false, eventId: '', status: '' });
            setEventId('');
            fetchData();
        } else {
            toast.error(result.message);
        }
    };

    const handleChangeStatus = async (status) => {
        if (!eventId) {
            toast.error('Event ID is required');
            return;
        }
        const result = await adminApi.changeEventStatus({
            eventId,
            status
        });
        if (result.success) {
            toast.success(result.message);
            fetchData();
        } else {
            toast.error(result.message);
        }
    };

    if (user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={32} className="text-red-400" />
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <p className="text-gray-400">Manage events, verify completions, and track platform stats</p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={18} className="text-green-400" />
                                <span className="text-gray-400 text-sm">Total Events</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border border-blue-500/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={18} className="text-blue-400" />
                                <span className="text-gray-400 text-sm">Upcoming</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle size={18} className="text-purple-400" />
                                <span className="text-gray-400 text-sm">Completed</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.completedEvents}</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={18} className="text-amber-400" />
                                <span className="text-gray-400 text-sm">Volunteers</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalVolunteers}</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500/10 to-red-600/5 border border-pink-500/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Award size={18} className="text-pink-400" />
                                <span className="text-gray-400 text-sm">Total Credits</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalCredits}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Verify Event Completion */}
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-400" />
                            Verify Event Completion
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">Mark an event as completed or cancelled</p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Event ID"
                                value={eventId}
                                onChange={(e) => setEventId(e.target.value)}
                                className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setVerifyModal({ open: true, eventId: eventId, status: 'COMPLETED' })}
                                    disabled={!eventId}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-all"
                                >
                                    <CheckCircle size={18} />
                                    Verify Completed
                                </button>
                                <button
                                    onClick={() => handleChangeStatus('CANCELLED')}
                                    disabled={!eventId}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all"
                                >
                                    <XCircle size={18} />
                                    Cancel Event
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-blue-400" />
                            Platform Activity
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-[#0a0b0f] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <TrendingUp size={18} className="text-green-400" />
                                    </div>
                                    <span className="text-gray-300">Volunteer Ratio</span>
                                </div>
                                <span className="text-green-400 font-semibold">
                                    {stats ? `${((stats.totalVolunteers / (stats.totalEvents || 1)) || 0).toFixed(1)}/event` : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#0a0b0f] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Award size={18} className="text-blue-400" />
                                    </div>
                                    <span className="text-gray-300">Avg Credits/Volunteer</span>
                                </div>
                                <span className="text-blue-400 font-semibold">
                                    {stats ? `${(stats.totalCredits / (stats.totalVolunteers || 1)).toFixed(0)}` : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#0a0b0f] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <Calendar size={18} className="text-purple-400" />
                                    </div>
                                    <span className="text-gray-300">Completion Rate</span>
                                </div>
                                <span className="text-purple-400 font-semibold">
                                    {stats ? `${((stats.completedEvents / (stats.totalEvents || 1)) * 100).toFixed(0)}%` : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Volunteers */}
                <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Award size={20} className="text-yellow-400" />
                        Top Volunteers
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">#</th>
                                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">User</th>
                                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">City</th>
                                    <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">Credits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((leader, index) => (
                                    <tr key={leader._id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4">
                                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                                                index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                                index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                'text-gray-500'
                                            }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <img src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} className="w-8 h-8 rounded-full" alt="" />
                                                <div>
                                                    <p className="text-white font-medium">{leader.name}</p>
                                                    <p className="text-gray-500 text-sm">@{leader.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400">{leader.city || 'Unknown'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="text-green-400 font-semibold">{leader.credits}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Verify Modal */}
                {verifyModal.open && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#13151c] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-semibold text-white mb-4">Verify Event Completion</h3>
                            <p className="text-gray-400 mb-4">Are you sure you want to mark this event as {verifyModal.status.toLowerCase()}?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleVerifyEvent}
                                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setVerifyModal({ open: false, eventId: '', status: '' })}
                                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;