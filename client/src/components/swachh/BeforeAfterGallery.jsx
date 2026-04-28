import { useState, useEffect, useRef } from 'react';
import { photoApi } from '../../api/photo.api.js';
import toast from 'react-hot-toast';
import { 
    Camera, 
    Upload, 
    ArrowLeft, 
    ArrowRight, 
    RotateCcw, 
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    Grid3X3,
    Layers
} from 'lucide-react';

const BeforeAfterGallery = ({ eventId, isOrganizer }) => {
    const [pairs, setPairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPair, setSelectedPair] = useState(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [viewMode, setViewMode] = useState('slider');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState('BEFORE');
    const [selectedBefore, setSelectedBefore] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [beforePhotos, setBeforePhotos] = useState([]);

    useEffect(() => {
        fetchPairs();
    }, [eventId]);

    const fetchPairs = async () => {
        setLoading(true);
        const result = await photoApi.getBeforeAfterPairs(eventId);
        if (result.success) {
            setPairs(result.data);
            const befores = result.data.filter(p => p.before).map(p => p.before);
            setBeforePhotos(befores);
        }
        setLoading(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a photo');
            return;
        }

        if (uploadType === 'AFTER' && !selectedBefore) {
            toast.error('Please select which before photo this is for');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('type', uploadType);
        
        if (uploadType === 'AFTER' && selectedBefore) {
            formData.append('beforePhotoId', selectedBefore._id);
        }

        const result = await photoApi.uploadBeforeAfter(eventId, formData);
        if (result.success) {
            toast.success(result.message);
            setShowUploadModal(false);
            setSelectedFile(null);
            setSelectedBefore(null);
            fetchPairs();
        } else {
            toast.error(result.message);
        }
        setUploading(false);
    };

    const compareRef = useRef(null);

    const handleSliderMove = (e) => {
        if (!compareRef.current) return;
        const rect = compareRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    };

    const handleMouseDown = () => {
        document.addEventListener('mousemove', handleSliderMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleSliderMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTouchMove = (e) => {
        if (!compareRef.current) return;
        const rect = compareRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Layers size={20} className="text-green-400" />
                    Before/After ({pairs.filter(p => p.before && p.after).length} pairs)
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('slider')}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                            viewMode === 'slider' ? 'bg-green-500 text-white' : 'bg-white/10 text-white'
                        }`}
                    >
                        <RotateCcw size={14} />
                        Slider
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                            viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white/10 text-white'
                        }`}
                    >
                        <Grid3X3 size={14} />
                        Grid
                    </button>
                    {(isOrganizer || eventId?.status === 'COMPLETED') && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-600"
                        >
                            <Upload size={14} />
                            Upload
                        </button>
                    )}
                </div>
            </div>

            {pairs.filter(p => p.before && p.after).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Camera size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No before/after photos yet</p>
                    <p className="text-sm">Upload before & after photos to show transformation</p>
                </div>
            ) : viewMode === 'slider' ? (
                <div className="space-y-4">
                    <div 
                        ref={compareRef}
                        className="relative w-full h-80 rounded-xl overflow-hidden cursor-ew-resize select-none"
                        onMouseDown={handleMouseDown}
                        onTouchMove={handleTouchMove}
                    >
                        {selectedPair ? (
                            <>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img 
                                        src={selectedPair.after?.imageUrl || selectedPair.before.imageUrl} 
                                        alt="After"
                                        className="w-full h-full object-contain bg-black"
                                    />
                                </div>
                                <div 
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: `${sliderPosition}%` }}
                                >
                                    <img 
                                        src={selectedPair.before.imageUrl} 
                                        alt="Before"
                                        className="w-full h-full object-contain bg-black"
                                    />
                                </div>
                                <div 
                                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <ChevronLeft size={14} className="text-gray-600" />
                                        <ChevronRight size={14} className="text-gray-600" />
                                    </div>
                                </div>
                                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                    BEFORE
                                </div>
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                    AFTER
                                </div>
                            </>
                        ) : pairs.filter(p => p.before && p.after).length > 0 ? (
                            <div 
                                className="grid grid-cols-2 lg:grid-cols-4 gap-2"
                                onClick={() => setSelectedPair(pairs.filter(p => p.before && p.after)[0])}
                            >
                                {pairs.filter(p => p.before && p.after).slice(0, 4).map((pair, idx) => (
                                    <div key={idx} className="relative h-40 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500">
                                        <img 
                                            src={pair.before.imageUrl} 
                                            alt="Before"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm">View Comparison</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {selectedPair && (
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setSelectedPair(null)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white"
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">
                                    {Math.round(sliderPosition)}% BEFORE
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {pairs.filter(p => p.before && p.after).map((pair, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="relative grid grid-cols-2 gap-1 h-32 rounded-lg overflow-hidden">
                                <img 
                                    src={pair.before.imageUrl} 
                                    alt="Before"
                                    className="w-full h-full object-cover"
                                />
                                <img 
                                    src={pair.after.imageUrl} 
                                    alt="After"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex justify-center gap-4 text-xs text-gray-500">
                                <span>BEFORE</span>
                                <span>AFTER</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUploadModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#13151c] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Upload size={20} className="text-green-400" />
                                Upload Before/After
                            </h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => { setUploadType('BEFORE'); setSelectedBefore(null); }}
                                className={`flex-1 px-4 py-2 rounded-xl text-sm ${
                                    uploadType === 'BEFORE' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'
                                }`}
                            >
                                Before Photo
                            </button>
                            <button
                                onClick={() => setUploadType('AFTER')}
                                className={`flex-1 px-4 py-2 rounded-xl text-sm ${
                                    uploadType === 'AFTER' ? 'bg-green-500 text-white' : 'bg-white/10 text-white'
                                }`}
                            >
                                After Photo
                            </button>
                        </div>

                        {uploadType === 'AFTER' && beforePhotos.length > 0 && (
                            <div className="mb-4">
                                <p className="text-gray-400 text-sm mb-2">Select corresponding "before" photo:</p>
                                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                    {beforePhotos.map((photo) => (
                                        <div 
                                            key={photo._id}
                                            onClick={() => setSelectedBefore(photo)}
                                            className={`relative h-16 rounded-lg overflow-hidden cursor-pointer ${
                                                selectedBefore?._id === photo._id ? 'ring-2 ring-green-500' : ''
                                            }`}
                                        >
                                            <img src={photo.imageUrl} alt="Before" className="w-full h-full object-cover" />
                                            {selectedBefore?._id === photo._id && (
                                                <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                                                    <Check size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
                        />

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BeforeAfterGallery;