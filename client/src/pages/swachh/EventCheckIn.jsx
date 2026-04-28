import { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/event.api.js';
import { volunteerApi } from '../../api/volunteer.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Calendar, MapPin, Clock, Users, Award, ArrowLeft, QrCode } from 'lucide-react';

const EventCheckIn = () => {
    const { eventId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [event, setEvent] = useState(null);
    const [checkedIn, setCheckedIn] = useState(false);
    const [error, setError] = useState(null);

    const qrCode = searchParams.get('code');

    useEffect(() => {
        if (user && qrCode && eventId) {
            fetchEventAndCheckIn();
        }
    }, [user, qrCode, eventId]);

    const fetchEventAndCheckIn = async () => {
        setLoading(true);
        setError(null);

        const eventResult = await eventApi.getEventById(eventId);
        if (!eventResult.success) {
            setError('Event not found');
            setLoading(false);
            return;
        }
        setEvent(eventResult.data);

        if (!qrCode) {
            setError('Invalid QR code');
            setLoading(false);
            return;
        }

        setCheckingIn(true);
        const result = await volunteerApi.checkIn(eventId, qrCode);
        
        if (result.success) {
            setCheckedIn(true);
            toast.success(result.message);
        } else {
            setError(result.message);
        }
        setCheckingIn(false);
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const styles = {
            UPCOMING: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Upcoming' },
            ONGOING: { bg: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Ongoing' },
            COMPLETED: { bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Completed' },
            CANCELLED: { bg: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Cancelled' }
        };
        return styles[status] || styles.UPCOMING;
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white mb-4">Please login to check in</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-green-500 text-white rounded-xl"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading || checkingIn) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-white">{checkingIn ? 'Checking in...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="min-h-screen bg-[#0a0b0f]">
                <Navbar />
                <main className="lg:ml-64 p-8 pt-20">
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-[#13151c] border border-red-500/20 rounded-2xl p-8">
                            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Check In Failed</h2>
                            <p className="text-gray-400 mb-6">{error}</p>
                            <button 
                                onClick={() => navigate('/home')}
                                className="px-6 py-3 bg-green-500 text-white rounded-xl"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const statusStyle = event ? getStatusBadge(event.status) : null;

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20">
                <button 
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="max-w-md mx-auto">
                    {checkedIn ? (
                        <div className="bg-[#13151c] border border-green-500/20 rounded-2xl p-8 text-center">
                            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Check In Successful!</h2>
                            <p className="text-green-400 mb-6">+{event?.creditsReward || 10} Credits Earned</p>
                        </div>
                    ) : error ? (
                        <div className="bg-[#13151c] border border-red-500/20 rounded-2xl p-8 text-center">
                            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Check In Failed</h2>
                            <p className="text-gray-400 mb-6">{error}</p>
                        </div>
                    ) : null}

                    {event && (
                        <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6 mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm border ${statusStyle?.bg}`}>
                                    {statusStyle?.label}
                                </span>
                            </div>
                            
                            <h1 className="text-xl font-bold text-white mb-2">{event.title}</h1>
                            <p className="text-gray-400 text-sm mb-4">{event.description}</p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Calendar size={18} />
                                    <span className="text-sm">{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Clock size={18} />
                                    <span className="text-sm">{event.startTime} - {event.endTime}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <MapPin size={18} />
                                    <span className="text-sm">{event.locationId?.name}, {event.locationId?.city}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Users size={18} />
                                    <span className="text-sm">{event.volunteersCount}/{event.maxVolunteers} volunteers</span>
                                </div>
                                <div className="flex items-center gap-3 text-green-400">
                                    <Award size={18} />
                                    <span className="text-sm">+{event.creditsReward} Credits</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="w-full mt-6 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
                            >
                                View Event Details
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EventCheckIn;