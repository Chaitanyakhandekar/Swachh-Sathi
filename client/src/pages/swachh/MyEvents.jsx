import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/event.api.js';
import { volunteerApi } from '../../api/volunteer.api.js';
import { adminApi } from '../../api/admin.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Clock, Users, ChevronRight, Plus, CalendarCheck, CheckCircle, XCircle } from 'lucide-react';

const MyEvents = () => {
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    const [organizedEvents, setOrganizedEvents] = useState([]);
    const [volunteeredEvents, setVolunteeredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('volunteered');

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        setLoading(true);
        const [organizedResult, volunteeredResult] = await Promise.all([
            eventApi.getMyEvents(),
            volunteerApi.getMyVolunteerEvents()
        ]);
        if (organizedResult.success) setOrganizedEvents(organizedResult.data);
        if (volunteeredResult.success) setVolunteeredEvents(volunteeredResult.data);
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const styles = {
            UPCOMING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            ONGOING: 'bg-green-500/10 text-green-400 border-green-500/20',
            COMPLETED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        return styles[status] || styles.UPCOMING;
    };

    const handleMarkCompleted = async (eventId) => {
        const result = await adminApi.verifyEventCompletion({ eventId, status: 'COMPLETED' });
        if (result.success) {
            toast.success('Event marked as completed!');
            fetchMyEvents();
        } else {
            toast.error(result.message);
        }
    };

    const handleMarkCancelled = async (eventId) => {
        const result = await adminApi.changeEventStatus({ eventId, status: 'CANCELLED' });
        if (result.success) {
            toast.success('Event cancelled');
            fetchMyEvents();
        } else {
            toast.error(result.message);
        }
    };

    const upcomingCount = volunteeredEvents.filter(e => e.eventId?.status === 'UPCOMING').length;
    const completedCount = volunteeredEvents.filter(e => e.eventId?.status === 'COMPLETED').length;

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto" style={{ height: '100vh' }}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                        <p className="text-gray-400">Track your volunteering journey</p>
                    </div>
                    {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                        <button
                            onClick={() => navigate('/create-event')}
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                        >
                            <Plus size={20} />
                            Create Event
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Calendar size={20} className="text-blue-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{volunteeredEvents.length}</p>
                        <p className="text-sm text-gray-400">Total Joined</p>
                    </div>
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Clock size={20} className="text-green-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{upcomingCount}</p>
                        <p className="text-sm text-gray-400">Upcoming</p>
                    </div>
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <CalendarCheck size={20} className="text-purple-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{completedCount}</p>
                        <p className="text-sm text-gray-400">Completed</p>
                    </div>
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Users size={20} className="text-green-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{organizedEvents.length}</p>
                        <p className="text-sm text-gray-400">Organized</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('volunteered')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                            activeTab === 'volunteered'
                                ? 'bg-green-500 text-white'
                                : 'bg-[#13151c] text-gray-400 hover:text-white border border-white/5'
                        }`}
                    >
                        Volunteered Events
                    </button>
                    {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                        <button
                            onClick={() => setActiveTab('organized')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                activeTab === 'organized'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[#13151c] text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            My Organized Events
                        </button>
                    )}
                </div>

                {/* Events List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-[#13151c] border border-white/5 rounded-2xl p-6 animate-pulse">
                                <div className="h-5 bg-white/5 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-white/5 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 pb-8">
                        {activeTab === 'volunteered' && (
                            volunteeredEvents.length === 0 ? (
                                <div className="bg-[#13151c] border border-white/5 rounded-2xl p-12 text-center">
                                    <Calendar size={48} className="mx-auto mb-4 text-gray-500" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No events joined yet</h3>
                                    <p className="text-gray-400 mb-4">Start volunteering to see your joined events here</p>
                                    <button onClick={() => navigate('/home')} className="text-green-400 hover:text-green-300">
                                        Browse Events
                                    </button>
                                </div>
                            ) : (
                                volunteeredEvents.map((vol) => (
                                    <div
                                        key={vol._id}
                                        onClick={() => navigate(`/event/${vol.eventId?._id}`)}
                                        className="bg-[#13151c] border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(vol.eventId?.status)}`}>
                                                        {vol.eventId?.status}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        vol.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' :
                                                        vol.status === 'ABSENT' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                        {vol.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-white mb-2">{vol.eventId?.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} className="text-green-400" />
                                                        {vol.eventId?.locationId?.city}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-blue-400" />
                                                        {vol.eventId && new Date(vol.eventId.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={24} className="text-gray-500" />
                                        </div>
                                    </div>
                                ))
                            )
                        )}

                        {activeTab === 'organized' && (
                            organizedEvents.length === 0 ? (
                                <div className="bg-[#13151c] border border-white/5 rounded-2xl p-12 text-center">
                                    <Users size={48} className="mx-auto mb-4 text-gray-500" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No events organized yet</h3>
                                    <p className="text-gray-400 mb-4">Create your first event to start making a difference</p>
                                    <button onClick={() => navigate('/create-event')} className="text-green-400 hover:text-green-300">
                                        Create Event
                                    </button>
                                </div>
                            ) : (
                                organizedEvents.map((event) => (
                                    <div
                                        key={event._id}
                                        className="bg-[#13151c] border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/event/${event._id}`)}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                                                        {event.status}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">
                                                        {event.volunteersCount}/{event.maxVolunteers} volunteers
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} className="text-green-400" />
                                                        {event.locationId?.city}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-blue-400" />
                                                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500">Event ID: </span>
                                                    <span className="text-xs text-gray-400 font-mono">{event._id}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Organizer Actions */}
                                            {(event.status === 'UPCOMING' || event.status === 'ONGOING') && (
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleMarkCompleted(event._id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all text-sm"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Mark Completed
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkCancelled(event._id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all text-sm"
                                                    >
                                                        <XCircle size={16} />
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyEvents;