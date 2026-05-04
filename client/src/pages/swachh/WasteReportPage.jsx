import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { wasteReportApi } from '../../api/wasteReport.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import Navbar from '../../components/swachh/Navbar.jsx';
import toast from 'react-hot-toast';
import { 
    Trash2, 
    MapPin, 
    Camera, 
    Upload, 
    X, 
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    Plus,
    Trash,
    EyeOff
} from 'lucide-react';

const WasteReportPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        description: '',
        wasteType: 'MIXED',
        estimatedQuantity: 'MEDIUM',
        latitude: '',
        longitude: '',
        address: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        fetchReports();
        fetchStats();
        getUserLocation();
    }, [filter]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {}
            );
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        const params = filter === 'all' ? {} : { status: filter };
        const result = await wasteReportApi.getReports(params);
        if (result.success) {
            setReports(result.data.reports || result.data);
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        const result = await wasteReportApi.getStats();
        if (result.success) {
            setStats(result.data);
        }
    };

    const handleSubmit = async () => {
        if (!formData.description.trim()) {
            toast.error('Please describe the waste location');
            return;
        }

        if (!userLocation && !formData.latitude) {
            toast.error('Location is required. Please enable location services.');
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append('description', formData.description);
        data.append('wasteType', formData.wasteType);
        data.append('estimatedQuantity', formData.estimatedQuantity);
        data.append('latitude', formData.latitude || userLocation?.lat);
        data.append('longitude', formData.longitude || userLocation?.lng);
        data.append('address', formData.address || '');
        
        if (selectedFile) {
            data.append('image', selectedFile);
        }

        const result = await wasteReportApi.createReport(data);
        if (result.success) {
            toast.success('Waste reported successfully!');
            setShowModal(false);
            setFormData({
                description: '',
                wasteType: 'MIXED',
                estimatedQuantity: 'MEDIUM',
                latitude: '',
                longitude: '',
                address: ''
            });
            setSelectedFile(null);
            fetchReports();
            fetchStats();
        } else {
            toast.error(result.message);
        }
        setUploading(false);
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm('Delete this report?')) return;
        
        const result = await wasteReportApi.deleteReport(reportId);
        if (result.success) {
            toast.success('Report deleted');
            fetchReports();
            fetchStats();
        } else {
            toast.error(result.message);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: 'bg-yellow-500/10 text-yellow-400', label: 'Pending' },
            VERIFIED: { bg: 'bg-blue-500/10 text-blue-400', label: 'Verified' },
            CLEANED: { bg: 'bg-green-500/10 text-green-400', label: 'Cleaned' },
            REJECTED: { bg: 'bg-red-500/10 text-red-400', label: 'Rejected' }
        };
        return styles[status] || styles.PENDING;
    };

    const getWasteTypeIcon = (type) => {
        const icons = {
            PLASTIC: '🧴',
            ORGANIC: '🍃',
            ELECTRONIC: '📱',
            CONSTRUCTION: '🏗️',
            MIXED: '🗑️',
            OTHER: '📦'
        };
        return icons[type] || '🗑️';
    };

    const getQuantityBadge = (qty) => {
        const sizes = { SMALL: 'Small', MEDIUM: 'Medium', LARGE: 'Large', HUGE: 'Huge' };
        return sizes[qty] || 'Medium';
    };

    const pendingCount = stats?.stats?.find(s => s._id === 'PENDING')?.count || 0;
    const cleanedCount = stats?.stats?.find(s => s._id === 'CLEANED')?.count || 0;

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Waste Reports</h1>
                        <p className="text-gray-400">Report garbage spots in your area</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                    >
                        <Plus size={18} />
                        Report Waste
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#13151c] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <AlertCircle size={18} />
                            <span className="text-sm">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                    </div>
                    <div className="bg-[#13151c] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <CheckCircle size={18} />
                            <span className="text-sm">Cleaned</span>
                        </div>
                        <p className="text-2xl font-bold text-green-400">{cleanedCount}</p>
                    </div>
                    <div className="bg-[#13151c] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Clock size={18} />
                            <span className="text-sm">This Month</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.thisMonth || 0}</p>
                    </div>
                    <div className="bg-[#13151c] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Trash2 size={18} />
                            <span className="text-sm">Total Cleaned</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.totalCleaned || 0}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-4 overflow-x-auto">
                    {['all', 'PENDING', 'VERIFIED', 'CLEANED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                                filter === f ? 'bg-green-500 text-white' : 'bg-white/10 text-white'
                            }`}
                        >
                            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Reports List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Trash2 size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No waste reports found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reports.map((report) => {
                            const statusStyle = getStatusBadge(report.status);
                            return (
                                <div key={report._id} className="bg-[#13151c] border border-white/5 rounded-xl p-4">
                                    {report.imageUrl && (
                                        <img 
                                            src={report.imageUrl} 
                                            alt="Waste" 
                                            className="w-full h-40 object-cover rounded-lg mb-3"
                                        />
                                    )}
                                    
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-2xl">{getWasteTypeIcon(report.wasteType)}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${statusStyle.bg}`}>
                                            {statusStyle.label}
                                        </span>
                                    </div>

                                    <p className="text-white font-medium mb-1 line-clamp-2">{report.description}</p>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                        <MapPin size={12} />
                                        <span className="truncate">{report.address || 'Unknown location'}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{getQuantityBadge(report.estimatedQuantity)}</span>
                                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {report.reportedBy?._id === user?._id && (
                                        <button
                                            onClick={() => handleDelete(report._id)}
                                            className="w-full mt-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Report Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#13151c] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Trash2 size={20} className="text-red-400" />
                                Report Waste
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the waste location..."
                                    className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 h-24 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-1 block">Waste Type</label>
                                    <select
                                        value={formData.wasteType}
                                        onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
                                        className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                                    >
                                        <option value="MIXED">Mixed</option>
                                        <option value="PLASTIC">Plastic</option>
                                        <option value="ORGANIC">Organic</option>
                                        <option value="ELECTRONIC">Electronic</option>
                                        <option value="CONSTRUCTION">Construction</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-1 block">Quantity</label>
                                    <select
                                        value={formData.estimatedQuantity}
                                        onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                                        className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                                    >
                                        <option value="SMALL">Small</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LARGE">Large</option>
                                        <option value="HUGE">Huge</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Photo (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white"
                                />
                            </div>

                            {userLocation && (
                                <div className="text-xs text-gray-500">
                                    Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                                >
                                    {uploading ? 'Reporting...' : 'Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WasteReportPage;