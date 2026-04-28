import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { X, Camera, CameraOff, RefreshCw, Keyboard } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [manualEntry, setManualEntry] = useState(false);
    const [qrInput, setQrInput] = useState('');
    const html5QrcodeRef = useRef(null);

    useEffect(() => {
        return () => {
            if (html5QrcodeRef.current) {
                html5QrcodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    const startScanning = async () => {
        setError(null);
        try {
            const devices = await Html5Qrcode.getCameras();
            if (!devices || devices.length === 0) {
                throw new Error('No camera found');
            }

            const cameraId = devices[0].id;
            
            html5QrcodeRef.current = new Html5Qrcode("qr-reader");
            
            await html5QrcodeRef.current.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    const urlMatch = decodedText.match(/\/event\/([^\/]+)\/checkin\?code=([^\/]+)/);
                    if (urlMatch) {
                        onScanSuccess(urlMatch[2], urlMatch[1]);
                    } else {
                        const codeMatch = decodedText.match(/code=([A-Z0-9]+)/i);
                        if (codeMatch) {
                            onScanSuccess(codeMatch[1], null);
                        } else {
                            onScanSuccess(decodedText, null);
                        }
                    }
                    stopScanning();
                },
                () => {}
            );
            setScanning(true);
        } catch (err) {
            console.error('Scanner error:', err);
            setError('Unable to access camera. Please use manual entry.');
            setManualEntry(true);
        }
    };

    const stopScanning = async () => {
        if (html5QrcodeRef.current) {
            try {
                await html5QrcodeRef.current.stop();
            } catch (e) {}
            html5QrcodeRef.current = null;
        }
        setScanning(false);
    };

    const handleManualCheckIn = () => {
        if (!qrInput.trim()) {
            toast.error('Please enter the QR code');
            return;
        }
        onScanSuccess(qrInput.trim(), null);
    };

    return (
        <div className="bg-[#13151c] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Camera size={20} className="text-green-400" />
                    Scan QR Code
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {!manualEntry ? (
                <div className="space-y-4">
                    <div 
                        id="qr-reader" 
                        className="w-full rounded-lg overflow-hidden bg-black"
                        style={{ 
                            minHeight: '250px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!scanning && !error && (
                            <div className="text-gray-400 text-center p-4">
                                <Camera size={48} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Click "Start Camera" to scan QR code</p>
                            </div>
                        )}
                    </div>
                    
                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <div className="flex gap-3">
                        {!scanning ? (
                            <button
                                onClick={startScanning}
                                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Camera size={18} />
                                Start Camera
                            </button>
                        ) : (
                            <button
                                onClick={stopScanning}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CameraOff size={18} />
                                Stop Camera
                            </button>
                        )}
                        <button
                            onClick={() => { stopScanning(); setManualEntry(true); }}
                            className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <Keyboard size={18} />
                            Manual
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-400 text-sm">
                        Enter the QR code manually or switch to camera
                    </p>
                    <input
                        type="text"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value.toUpperCase())}
                        placeholder="Enter QR code (e.g., ABC123XYZ)"
                        className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 font-mono"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={handleManualCheckIn}
                            disabled={!qrInput.trim()}
                            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                            Check In
                        </button>
                        <button
                            onClick={() => { 
                                setManualEntry(false); 
                                setQrInput(''); 
                                setTimeout(startScanning, 100);
                            }}
                            className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Camera
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;