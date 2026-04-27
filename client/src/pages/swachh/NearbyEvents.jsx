import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/event.api.js';
import { volunteerApi } from '../../api/volunteer.api.js';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { MapPin, Navigation, Loader, Calendar, Clock, AlertCircle } from 'lucide-react';

const NearbyEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState('checking');
    const [location, setLocation] = useState(null);
    const [radius, setRadius] = useState(10);

    useEffect(() => {
        requestLocation();
    }, [radius]);

    const requestLocation = () => {
        setLocationStatus('checking');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationStatus('granted');
                },
                (error) => {
                    setLocationStatus('denied');
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocationStatus('unsupported');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location) {
            fetchNearbyEvents();
        }
    }, [location]);

    const fetchNearbyEvents = async () => {
        setLoading(true);
        const result = await eventApi.getNearbyEvents({
            lat: location.lat,
            lng: location.lng,
            radiusKm: radius
        });
        if (result.success) {
            setEvents(result.data);
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleJoin = async (eventId, e) => {
        e.stopPropagation();
        const result = await volunteerApi.joinEvent(eventId);
        if (result.success) {
            toast.success(result.message);
            fetchNearbyEvents();
        } else {
            toast.error(result.message);
        }
    };

    const getDistanceColor = (distance) => {
        if (distance < 500) return 'text-green-400';
        if (distance < 2000) return 'text-blue-400';
        if (distance < 5000) return 'text-yellow-400';
        return 'text-gray-400';
    };

    if (locationStatus === 'checking') {
        return (
            <div className="min-h-screen bg-[#0a0b0f]">
                <Navbar />
                <main className="lg:ml-64 p-8 pt-20">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-pulse">
                            <Navigation size={32} className="text-green-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Getting your location...</h2>
                        <p className="text-gray-400">Please allow location access to find nearby events</p>
                    </div>
                </main>
            </div>
        );
    }

    if (locationStatus === 'denied' || locationStatus === 'unsupported') {
        return (
            <div className="min-h-screen bg-[#0a0b0f]">
                <Navbar />
                <main className="lg:ml-64 p-8 pt-20">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertCircle size={32} className="text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Location Access Required</h2>
                        <p className="text-gray-400 mb-4 text-center max-w-md">
                            {locationStatus === 'denied' 
                                ? "Please enable location access in your browser settings to find nearby events."
                                : "Your browser doesn't support geolocation. Please use a modern browser."}
                        </p>
                        <button
                            onClick={requestLocation}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Nearby Events</h1>
                    <p className="text-gray-400">Find cleanliness drives near you</p>
                </div>

                {/* Radius Filter */}
                <div className="bg-[#13151c] border border-white/5 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Navigation size={18} className="text-green-400" />
                        <span className="text-gray-400">Search within:</span>
                        <div className="flex gap-2">
                            {[5, 10, 25, 50].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRadius(r)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        radius === r
                                            ? 'bg-green-500 text-white'
                                            : 'bg-[#0a0b0f] text-gray-400 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {r} km
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader size={40} className="text-green-400 animate-spin" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                            <MapPin size={32} className="text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No events nearby</h3>
                        <p className="text-gray-400">No events found within {radius}km radius. Be the first to organize one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.map((event) => (
                            <div
                                key={event._id}
                                onClick={() => navigate(`/event/${event._id}`)}
                                className="group bg-[#13151c] border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all cursor-pointer"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Navigation size={16} className="text-green-400" />
                                            </div>
                                            <span className={`text-sm font-medium ${getDistanceColor(event.distance)}`}>
                                                {event.distance < 1000 
                                                    ? `${Math.round(event.distance)}m away` 
                                                    : `${(event.distance / 1000).toFixed(1)}km away`}
                                            </span>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {event.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-blue-400" />
                                            <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} className="text-purple-400" />
                                            <span>{event.startTime}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-green-400 font-semibold">+{event.creditsReward} ⭐</span>
                                        {event.status !== 'COMPLETED' && event.status !== 'CANCELLED' && (
                                            <button
                                                onClick={(e) => handleJoin(event._id, e)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all"
                                            >
                                                Join
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

export default NearbyEvents;