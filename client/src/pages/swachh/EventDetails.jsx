import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/event.api.js';
import { volunteerApi } from '../../api/volunteer.api.js';
import { photoApi } from '../../api/photo.api.js';
import { notificationApi } from '../../api/notification.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import eventChatApi from '../../api/eventChat.api.js';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Clock, Users, Award, CheckCircle, Upload, Image, ArrowLeft, Share2, X, Trash2, Send, Megaphone, MessageSquare } from 'lucide-react';

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    const [event, setEvent] = useState(null);
    const [volunteers, setVolunteers] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [joined, setJoined] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [announcementText, setAnnouncementText] = useState('');
    const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatClosed, setChatClosed] = useState(false);

    const isOrganizer = useMemo(() => {
        if (!user || !event) return false;
        return user._id === event.organizerId?._id || user.role === 'ADMIN' || user.role === 'ORGANIZER';
    }, [user, event]);

    const canChat = useMemo(() => joined || isOrganizer, [joined, isOrganizer]);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    useEffect(() => {
        if (event && user) {
            const isOrg = user._id === event.organizerId?._id || user.role === 'ADMIN' || user.role === 'ORGANIZER';
            const hasJoined = volunteers.some(v => v.userId?._id === user._id);
            if (hasJoined || isOrg) {
                fetchChatMessages();
            }
        }
    }, [event, volunteers, user]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedPhoto) return;
            if (e.key === 'ArrowLeft') prevPhoto();
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'Escape') setSelectedPhoto(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPhoto, currentPhotoIndex, photos.length]);

    const fetchEventDetails = async () => {
        const [eventResult, volunteersResult, photosResult] = await Promise.all([
            eventApi.getEventById(eventId),
            volunteerApi.getEventVolunteers(eventId),
            photoApi.getEventPhotos(eventId)
        ]);

        if (eventResult.success) setEvent(eventResult.data);
        if (volunteersResult.success) {
            setVolunteers(volunteersResult.data);
            setJoined(volunteersResult.data.some(v => v.userId?._id === user?._id));
        }
        if (photosResult.success) setPhotos(photosResult.data);
        setLoading(false);
    };

    const handleJoin = async () => {
        const result = await volunteerApi.joinEvent(eventId);
        if (result.success) {
            toast.success(result.message);
            fetchEventDetails();
        } else {
            toast.error(result.message);
        }
    };

    const handleLeave = async () => {
        const result = await volunteerApi.leaveEvent(eventId);
        if (result.success) {
            toast.success(result.message);
            fetchEventDetails();
        } else {
            toast.error(result.message);
        }
    };

    const handleUploadPhoto = async () => {
        if (!selectedFile) {
            toast.error('Please select a photo');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        const result = await photoApi.uploadPhoto(eventId, formData);
        if (result.success) {
            toast.success(result.message);
            setSelectedFile(null);
            fetchEventDetails();
        } else {
            toast.error(result.message);
        }
        setUploading(false);
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        const result = await photoApi.deletePhoto(photoId);
        if (result.success) {
            toast.success('Photo deleted');
            fetchEventDetails();
        } else {
            toast.error(result.message);
        }
    };

    const handleSendAnnouncement = async () => {
        if (!announcementText.trim()) {
            toast.error('Please enter announcement text');
            return;
        }
        setSendingAnnouncement(true);
        const result = await notificationApi.sendEventAnnouncement(eventId, { content: announcementText });
        if (result.success) {
            toast.success('Announcement sent to all volunteers');
            setShowAnnouncement(false);
            setAnnouncementText('');
        } else {
            toast.error(result.message);
        }
setSendingAnnouncement(false);
    };

    const canAccessChat = () => isJoined || isOrganizer;

    const fetchChatMessages = async () => {
        if (!canChat) return;
        setChatLoading(true);
        const result = await eventChatApi.getMessages(eventId);
        if (result.success) {
            setChatMessages(result.data?.messages || []);
            setChatClosed(result.data?.isClosed || false);
        }
        setChatLoading(false);
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatClosed) return;
        const result = await eventChatApi.sendMessage(eventId, chatInput);
        if (result.success) {
            setChatMessages(prev => [...prev, result.data]);
            setChatInput('');
        }
    };

    const canJoin = (event?.status === 'UPCOMING' || event?.status === 'ONGOING') && !joined;

    const getStatusBadge = (status) => {
        const styles = {
            UPCOMING: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Upcoming' },
            ONGOING: { bg: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Ongoing' },
            COMPLETED: { bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Completed' },
            CANCELLED: { bg: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Cancelled' }
        };
        return styles[status] || styles.UPCOMING;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0b0f]">
                <Navbar />
                <main className="lg:ml-64 p-8 pt-20">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-white/5 rounded w-1/3"></div>
                        <div className="h-4 bg-white/5 rounded w-1/2"></div>
                        <div className="h-64 bg-white/5 rounded"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#0a0b0f]">
                <Navbar />
                <main className="lg:ml-64 p-8 pt-20">
                    <div className="text-center py-20">
                        <h2 className="text-xl font-semibold text-white">Event not found</h2>
                        <button onClick={() => navigate('/home')} className="mt-4 text-green-400 hover:text-green-300">
                            Go back home
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const statusStyle = getStatusBadge(event.status);

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to events</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Header */}
                        <div className="bg-[#13151c] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 lg:p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${statusStyle.bg}`}>
                                        {statusStyle.label}
                                    </span>
                                    {event.isVerified && (
                                        <div className="flex items-center gap-1 text-green-400">
                                            <CheckCircle size={18} />
                                            <span className="text-sm">Verified</span>
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">{event.title}</h1>
                                <p className="text-gray-400 mb-6">{event.description}</p>

                                {/* Event Info Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#0a0b0f] rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                                            <Calendar size={18} />
                                            <span className="text-sm">Date</span>
                                        </div>
                                        <p className="text-white font-medium">{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="bg-[#0a0b0f] rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                                            <Clock size={18} />
                                            <span className="text-sm">Time</span>
                                        </div>
                                        <p className="text-white font-medium">{event.startTime} - {event.endTime}</p>
                                    </div>
                                    <div className="bg-[#0a0b0f] rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                                            <Users size={18} />
                                            <span className="text-sm">Volunteers</span>
                                        </div>
                                        <p className="text-white font-medium">{event.volunteersCount}/{event.maxVolunteers}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/10 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-green-400 mb-2">
                                            <Award size={18} />
                                            <span className="text-sm">Reward</span>
                                        </div>
                                        <p className="text-green-400 font-bold text-xl">+{event.creditsReward} Credits</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="bg-[#0a0b0f] rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                        <MapPin size={18} className="text-red-400" />
                                        <span className="text-sm">Location</span>
                                    </div>
                                    <p className="text-white font-medium">{event.locationId?.name}</p>
                                    <p className="text-gray-500 text-sm">{event.locationId?.address}, {event.locationId?.city}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 lg:px-8 pb-6 lg:pb-8 flex flex-wrap gap-3">
                                {canJoin && (
                                    isJoined ? (
                                        <button onClick={handleLeave} className="flex-1 min-w-[140px] px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-all">
                                            Leave Event
                                        </button>
                                    ) : (
                                        <button onClick={handleJoin} className="flex-1 min-w-[140px] px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                                            Join Event
                                        </button>
                                    )
                                )}
                                <button className="flex-1 min-w-[140px] px-6 py-3 bg-white/5 text-white border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <Share2 size={18} />
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Image size={20} className="text-green-400" />
                                Event Gallery ({photos.length})
                            </h3>
                            {photos.length > 0 ? (
                                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                                    {photos.map((photo, index) => {
                                        const canDelete = photo.uploadedBy?._id === user?._id || user?.role === 'ADMIN' || user?._id === event?.organizerId?._id;
                                        return (
                                            <div key={photo._id} className="relative group">
                                                <img 
                                                    src={photo.imageUrl} 
                                                    alt="event" 
                                                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => { setSelectedPhoto(photo.imageUrl); setCurrentPhotoIndex(index); }}
                                                />
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeletePhoto(photo._id)}
                                                        className="absolute top-1 right-1 p-1.5 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        title="Delete photo"
                                                    >
                                                        <Trash2 size={14} className="text-white" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 mb-4">No photos uploaded yet</p>
                            )}
                            <div className="flex gap-3">
                                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600" />
                                <button onClick={handleUploadPhoto} disabled={!selectedFile || uploading} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all">
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Event Chat */}
                    {canChat && (
                        <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <MessageSquare size={20} className="text-green-400" />
                                Event Chat {chatClosed && <span className="text-xs text-gray-500 ml-2">(Closed)</span>}
                            </h3>
                            <div className="bg-[#0a0b0f] rounded-xl p-3 max-h-64 overflow-y-auto space-y-3 mb-3">
                                {chatLoading ? (
                                    <p className="text-gray-500 text-center py-4">Loading...</p>
                                ) : chatMessages.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No messages yet</p>
                                ) : (
                                    chatMessages.map((msg) => {
                                        const senderId = msg.sender?._id || msg.sender;
                                        const isMe = senderId === user?._id;
                                        return (
                                            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <span className="text-xs text-gray-500">{msg.sender?.name || msg.sender?.username || 'User'}</span>
                                                <div className={`px-3 py-2 rounded-lg max-w-[80%] ${isMe ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {!chatClosed ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={chatInput} 
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-[#0a0b0f] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                                    />
                                    <button onClick={sendChatMessage} disabled={!chatInput.trim()} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50">
                                        <Send size={18} />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center">This chat is closed</p>
                            )}
                        </div>
                    )}

                    {/* Sidebar - Volunteers */}
                    <div className="space-y-6">
                        <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Users size={20} className="text-green-400" />
                                    Volunteers ({volunteers.length})
                                </h3>
                                {isOrganizer && volunteers.length > 0 && (
                                    <button
                                        onClick={() => setShowAnnouncement(true)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                                    >
                                        <Megaphone size={14} />
                                        Announce
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {volunteers.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No volunteers yet</p>
                                ) : (
                                    volunteers.map((vol) => (
                                        <div key={vol._id} className="flex items-center justify-between p-3 bg-[#0a0b0f] rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <img src={vol.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${vol.userId?.username}`} className="w-10 h-10 rounded-full" alt="" />
                                                <div>
                                                    <p className="text-white font-medium text-sm">{vol.userId?.name}</p>
                                                    <p className="text-gray-500 text-xs">{vol.userId?.credits || 0} credits</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                vol.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' :
                                                vol.status === 'ABSENT' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {vol.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Organizer */}
                        <div className="bg-[#13151c] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Organizer</h3>
                            <div className="flex items-center gap-3">
                                <img src={event.organizerId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizerId?.username}`} className="w-12 h-12 rounded-full" alt="" />
                                <div>
                                    <p className="text-white font-medium">{event.organizerId?.name}</p>
                                    <p className="text-gray-500 text-sm">@{event.organizerId?.username}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Photo Lightbox */}
                {selectedPhoto && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
                        <button className="absolute top-4 right-4 p-2 text-white hover:text-green-400 transition-colors z-10" onClick={() => setSelectedPhoto(null)}>
                            <X size={32} />
                        </button>
                        
                        {currentPhotoIndex > 0 && (
                            <button 
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                        )}
                        
                        {currentPhotoIndex < photos.length - 1 && (
                            <button 
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        )}
                        
                        <img 
                            src={selectedPhoto} 
                            alt="full" 
                            className="max-w-full max-h-full object-contain rounded-lg" 
                            onClick={(e) => e.stopPropagation()} 
                        />
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                            {currentPhotoIndex + 1} / {photos.length}
                        </div>
                    </div>
                )}
                
                {/* Announcement Modal */}
                {showAnnouncement && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAnnouncement(false)}>
                        <div className="bg-[#13151c] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Megaphone size={20} className="text-green-400" />
                                    Send Announcement
                                </h3>
                                <button onClick={() => setShowAnnouncement(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">This announcement will be sent to all {volunteers.length} volunteers.</p>
                            <textarea
                                value={announcementText}
                                onChange={(e) => setAnnouncementText(e.target.value)}
                                placeholder="Enter your announcement message..."
                                className="w-full h-32 bg-[#0a0b0f] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 resize-none"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowAnnouncement(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendAnnouncement}
                                    disabled={sendingAnnouncement || !announcementText.trim()}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send size={16} />
                                    {sendingAnnouncement ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EventDetails;