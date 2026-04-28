import { useEffect, useState } from 'react';
import { eventApi } from '../../api/event.api.js';
import toast from 'react-hot-toast';
import { QrCode, Download, RefreshCw, X, Copy, Check } from 'lucide-react';

const EventQRDisplay = ({ eventId, onClose }) => {
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchQRCode();
    }, [eventId]);

    const fetchQRCode = async () => {
        setLoading(true);
        const result = await eventApi.getEventQRCodeImage(eventId);
        if (result.success) {
            setQrCodeImage(result.data.qrCodeImage);
            setQrCode(result.data.qrCode);
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleRegenerate = async () => {
        if (!window.confirm('Regenerating will invalidate the current QR code. Are you sure?')) return;
        
        setRegenerating(true);
        const regenResult = await eventApi.getEventQRCode(eventId);
        
        if (regenResult.success) {
            toast.success('QR code regenerated');
            await fetchQRCode();
        } else {
            toast.error(regenResult.message);
        }
        setRegenerating(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(qrCode);
        setCopied(true);
        toast.success('QR code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQRCode = () => {
        if (!qrCodeImage) return;
        
        const link = document.createElement('a');
        link.href = qrCodeImage;
        link.download = `event-${eventId}-qrcode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-[#13151c] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <QrCode size={20} className="text-green-400" />
                    Event QR Code
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-center">
                        {qrCodeImage && (
                            <img src={qrCodeImage} alt="QR Code" className="w-48 h-48 rounded-lg border-2 border-white/10" />
                        )}
                    </div>

                    <div className="bg-[#0a0b0f] rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-1">QR Code String</p>
                        <p className="text-white font-mono text-sm truncate">{qrCode}</p>
                    </div>

                    <p className="text-gray-400 text-xs text-center">
                        Show this QR code to volunteers so they can scan and check in
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={handleCopy}
                            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                        <button
                            onClick={downloadQRCode}
                            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            Download
                        </button>
                        <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventQRDisplay;