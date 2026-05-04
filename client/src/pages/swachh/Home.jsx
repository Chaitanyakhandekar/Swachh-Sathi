import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/event.api.js';
import { volunteerApi } from '../../api/volunteer.api.js';
import { adminApi } from '../../api/admin.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Users, Trophy, TrendingUp, Clock, Search, Filter, Plus, Trash2, Leaf } from 'lucide-react';

const Home = () => {
    const { user } = useContext(authContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState({ city: '', status: '' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEvents();
        fetchStats();
    }, [filter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const result = await eventApi.getAllEvents(filter);
            if (result.success) {
                setEvents(result.data.events || []);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const result = await adminApi.getStats();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleJoin = async (eventId, e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await volunteerApi.joinEvent(eventId);
        if (result.success) {
            toast.success(result.message);
            fetchEvents();
        } else {
            toast.error(result.message);
        }
    };

    const filteredEvents = events.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const styles = {
            UPCOMING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            ONGOING: 'bg-green-500/10 text-green-400 border-green-500/20',
            COMPLETED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        return styles[status] || styles.UPCOMING;
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Welcome back, <span className="text-green-400">{user?.name?.split(' ')[0]}</span>! 👋
                            </h1>
                            <p className="text-gray-400">Join the cleanliness movement and earn rewards</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/20 rounded-xl px-4 py-2">
                                <p className="text-xs text-gray-400">Your Credits</p>
                                <p className="text-xl font-bold text-green-400">⭐ {user?.credits || 0}</p>
                            </div>
                            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                                <Link to="/create-event" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-green-500/20">
                                    <Plus size={18} />
                                    Create Event
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/10 rounded-2xl p-5 hover:border-green-500/30 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <Calendar size={20} className="text-green-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                                <p className="text-sm text-gray-400">Total Events</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border border-blue-500/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Clock size={20} className="text-blue-400" />
                                    </div>
                                    <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">Live</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.ongoingEvents || 0}</p>
                                <p className="text-sm text-gray-400">Active Events</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Users size={20} className="text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.activeVolunteers}</p>
                                <p className="text-sm text-gray-400">Active Volunteers</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-500/10 to-orange-600/5 border border-red-500/10 rounded-2xl p-5 hover:border-red-500/30 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                        <Trash2 size={20} className="text-red-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.totalWasteCollectedKg || 0}kg</p>
                                <p className="text-sm text-gray-400">Waste Collected</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <Leaf size={20} className="text-amber-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.totalCo2ImpactKg || 0}kg</p>
                                <p className="text-sm text-gray-400">CO₂ Impact</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search & Filter */}
                <div className="bg-[#13151c] border border-white/5 rounded-2xl p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="w-full bg-[#0a0b0f] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter by city..."
                            className="lg:w-48 bg-[#0a0b0f] border border-white/5 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none transition-all"
                            onChange={(e) => setFilter({ ...filter, city: e.target.value })}
                        />
                        <select
                            className="bg-[#0a0b0f] border border-white/5 rounded-xl py-3 px-4 text-white focus:border-green-500/50 focus:outline-none transition-all cursor-pointer"
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-[#13151c] border border-white/5 rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-white/5 rounded w-1/4 mb-4"></div>
                                <div className="h-6 bg-white/5 rounded w-3/4 mb-2"></div>
                                <div className="h-16 bg-white/5 rounded mb-4"></div>
                                <div className="flex gap-2 mb-4">
                                    <div className="h-8 bg-white/5 rounded w-1/3"></div>
                                    <div className="h-8 bg-white/5 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Calendar size={32} className="text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
                        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                            <Link to="/create-event" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300">
                                <Plus size={18} />
                                Create the first event
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <div
                                key={event._id}
                                onClick={() => navigate(`/event/${event._id}`)}
                                className="group bg-[#13151c] border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 transition-all cursor-pointer"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                                            {event.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                                            <Users size={14} />
                                            <span>{event.volunteersCount}/{event.maxVolunteers}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors line-clamp-1">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-green-400" />
                                            <span>{event.locationId?.name}, {event.locationId?.city}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-blue-400" />
                                            <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-purple-400" />
                                            <span>{event.startTime} - {event.endTime}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-green-400 font-semibold">+{event.creditsReward} ⭐</span>
                                        {event.status !== 'COMPLETED' && event.status !== 'CANCELLED' && (
                                            <button
                                                onClick={(e) => handleJoin(event._id, e)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all"
                                            >
                                                Join Event
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;