import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/event.api.js';
import { locationApi } from '../../api/location.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Clock, Users, Award, ArrowLeft, Loader, Plus, X, ChevronDown, Edit2, Trash2 } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '09:00',
        endTime: '12:00',
        locationId: '',
        maxVolunteers: 50,
        creditsReward: 10
    });

    const [newLocation, setNewLocation] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        coordinates: [0, 0]
    });

    useEffect(() => {
        if (user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN') {
            toast.error('Only organizers can create events');
            navigate('/home');
            return;
        }
        fetchLocations();
    }, [user]);

    const fetchLocations = async () => {
        const result = await locationApi.getAllLocations();
        if (result.success) {
            setLocations(result.data);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (location) => {
        setSelectedLocation(location);
        setFormData({ ...formData, locationId: location._id });
        setLocationDropdownOpen(false);
    };

    const handleCreateLocation = async () => {
        if (!newLocation.name || !newLocation.address || !newLocation.city || !newLocation.state) {
            toast.error('Please fill all required location fields');
            return;
        }

        // Get user coordinates if available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setNewLocation(prev => ({
                        ...prev,
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    }));
                }
            );
        }

        const result = await locationApi.createLocation(newLocation);
        if (result.success) {
            toast.success('Location created successfully');
            setLocations(prev => [...prev, result.data]);
            setSelectedLocation(result.data);
            setFormData(prev => ({ ...prev, locationId: result.data._id }));
            setShowLocationModal(false);
            setNewLocation({ name: '', address: '', city: '', state: '', pincode: '', coordinates: [0, 0] });
        } else {
            toast.error(result.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.locationId) {
            toast.error('Please select a location');
            return;
        }
        setLoading(true);
        const result = await eventApi.createEvent(formData);
        if (result.success) {
            toast.success(result.message);
            navigate('/my-events');
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setNewLocation(prev => ({
                        ...prev,
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    }));
                    toast.success('Location captured! You can adjust if needed.');
                },
                () => {
                    toast.error('Could not get current location');
                }
            );
        } else {
            toast.error('Geolocation not supported');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
                        <p className="text-gray-400">Organize a cleanliness drive in your community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-[#13151c] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Event Title *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none transition-all"
                                placeholder="e.g., Beach Cleanup Drive"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none transition-all"
                                placeholder="Describe the event, what volunteers should bring, etc."
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Calendar size={14} className="inline mr-1" /> Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Clock size={14} className="inline mr-1" /> Start Time *
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    required
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Clock size={14} className="inline mr-1" /> End Time *
                                </label>
                                <input
                                    type="time"
                                    name="endTime"
                                    required
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Location Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <MapPin size={14} className="inline mr-1" /> Location *
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                                    className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-left text-white flex items-center justify-between focus:border-green-500/50 focus:outline-none transition-all"
                                >
                                    {selectedLocation ? (
                                        <span>{selectedLocation.name} - {selectedLocation.city}</span>
                                    ) : (
                                        <span className="text-gray-500">Select a location</span>
                                    )}
                                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {locationDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d28] border border-white/10 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
                                        {locations.length > 0 ? (
                                            <div className="p-2">
                                                {locations.map((loc) => (
                                                    <button
                                                        key={loc._id}
                                                        type="button"
                                                        onClick={() => handleLocationChange(loc)}
                                                        className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-all"
                                                    >
                                                        <p className="text-white font-medium">{loc.name}</p>
                                                        <p className="text-gray-500 text-sm">{loc.address}, {loc.city}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-gray-500">No locations found</div>
                                        )}
                                        <div className="border-t border-white/5 p-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowLocationModal(true);
                                                    setLocationDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-3 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                            >
                                                <Plus size={18} />
                                                Create New Location
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Max Volunteers & Credits */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Users size={14} className="inline mr-1" /> Max Volunteers
                                </label>
                                <input
                                    type="number"
                                    name="maxVolunteers"
                                    min="5"
                                    max="500"
                                    value={formData.maxVolunteers}
                                    onChange={handleChange}
                                    className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Award size={14} className="inline mr-1" /> Credits Reward
                                </label>
                                <input
                                    type="number"
                                    name="creditsReward"
                                    min="1"
                                    max="100"
                                    value={formData.creditsReward}
                                    onChange={handleChange}
                                    className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        Creating Event...
                                    </>
                                ) : (
                                    'Create Event'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Create Location Modal */}
                {showLocationModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#13151c] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <MapPin size={22} className="text-green-400" />
                                    Create New Location
                                </h3>
                                <button onClick={() => setShowLocationModal(false)} className="p-2 text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Location Name *</label>
                                    <input
                                        type="text"
                                        value={newLocation.name}
                                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                        className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                                        placeholder="e.g., Marina Beach"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                                    <input
                                        type="text"
                                        value={newLocation.address}
                                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                        className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                                        placeholder="e.g., Beach Road"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                                        <input
                                            type="text"
                                            value={newLocation.city}
                                            onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                                            placeholder="Chennai"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                                        <input
                                            type="text"
                                            value={newLocation.state}
                                            onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                                            placeholder="Tamil Nadu"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        value={newLocation.pincode}
                                        onChange={(e) => setNewLocation({ ...newLocation, pincode: e.target.value })}
                                        className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                                        placeholder="600001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Coordinates</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newLocation.coordinates[1]}
                                            onChange={(e) => setNewLocation({ ...newLocation, coordinates: [newLocation.coordinates[0], parseFloat(e.target.value) || 0] })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                                            placeholder="Latitude"
                                        />
                                        <input
                                            type="text"
                                            value={newLocation.coordinates[0]}
                                            onChange={(e) => setNewLocation({ ...newLocation, coordinates: [parseFloat(e.target.value) || 0, newLocation.coordinates[1]] })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                                            placeholder="Longitude"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="mt-2 w-full py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-sm"
                                    >
                                        📍 Use Current Location
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCreateLocation}
                                    className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-medium"
                                >
                                    Create Location
                                </button>
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
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

export default CreateEvent;