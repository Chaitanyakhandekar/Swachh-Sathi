import { useState, useEffect, useContext } from 'react';
import { authContext } from '../../context/AuthProvider.jsx';
import { userApi } from '../../api/user.api.js';
import { volunteerApi } from '../../api/volunteer.api.js';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { Award, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useContext(authContext);
    const [myEvents, setMyEvents] = useState([]);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        city: user?.city || ''
    });

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        const result = await volunteerApi.getMyVolunteerEvents();
        if (result.success) {
            setMyEvents(result.data);
        }
    };

    const handleSave = async () => {
        const result = await userApi.updateProfile(formData);
        if (result.success) {
            setUser(result.data);
            toast.success('Profile updated successfully');
            setEditing(false);
        } else {
            toast.error(result.message);
        }
    };

    const getBadgeStyle = (badge) => {
        const styles = {
            'FIRST_EVENT': { icon: '🎯', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
            'TOP_VOLUNTEER': { icon: '🏆', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
            'CLEAN_CHAMPION': { icon: '🌟', bg: 'bg-green-500/10 text-green-400 border-green-500/20' },
            'ECO_WARRIOR': { icon: '🌱', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
        };
        return styles[badge] || null;
    };

    const completedEvents = myEvents.filter(e => e.status === 'PRESENT' || e.eventId?.status === 'COMPLETED').length;
    const totalCreditsEarned = myEvents.filter(e => e.status === 'PRESENT').length * (user?.credits || 0);

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                {/* Profile Header */}
                <div className="bg-[#13151c] border border-white/5 rounded-2xl overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-green-500/20 to-emerald-600/20"></div>
                    <div className="px-6 lg:px-8 pb-6">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4 -mt-12">
                            <img 
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                                className="w-24 h-24 rounded-2xl border-4 border-[#13151c]" 
                                alt="" 
                            />
                            <div className="flex-1">
                                {editing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="Name"
                                        />
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="Username"
                                        />
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="City"
                                        />
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-[#0a0b0f] border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="Bio"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                <Save size={16} />
                                                Save
                                            </button>
                                            <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                                                <X size={16} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div>
                                            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                                            <p className="text-gray-400">@{user?.username}</p>
                                        </div>
                                        <div className="lg:ml-auto flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                {user?.role}
                                            </span>
                                            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all">
                                                <Edit2 size={16} />
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Credits</span>
                            <Award size={20} className="text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-green-400">{user?.credits || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border border-blue-500/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Events Joined</span>
                            <Calendar size={20} className="text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{myEvents.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Events Completed</span>
                            <MapPin size={20} className="text-purple-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{completedEvents}</p>
                    </div>
                </div>

                {/* Badges */}
                {user?.badges?.length > 0 && user.badges.filter(b => b).length > 0 && (
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Badges</h3>
                        <div className="flex flex-wrap gap-3">
                            {user.badges.filter(b => b).map((badge, idx) => {
                                const style = getBadgeStyle(badge);
                                return style && (
                                    <span key={idx} className={`px-4 py-2 rounded-full text-sm font-medium border ${style.bg}`}>
                                        {style.icon} {badge.replace(/_/g, ' ')}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bio & City */}
                <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                    <div className="space-y-4">
                        {user?.city && (
                            <div className="flex items-center gap-3 text-gray-400">
                                <MapPin size={18} className="text-green-400" />
                                <span>{user.city}</span>
                            </div>
                        )}
                        <p className="text-gray-400">
                            {user?.bio || 'No bio added yet.'}
                        </p>
                        <p className="text-gray-500 text-sm">
                            Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;