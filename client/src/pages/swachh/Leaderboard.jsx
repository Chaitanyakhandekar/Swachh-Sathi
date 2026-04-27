import { useState, useEffect, useContext } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { authContext } from '../../context/AuthProvider.jsx';
import Navbar from '../../components/swachh/Navbar.jsx';
import { Medal, Trophy, Crown, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useContext(authContext);
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const result = await adminApi.getLeaderboard({ limit: 50 });
            console.log("Leaderboard result:", result);
            if (result.success) {
                setLeaders(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            console.error("Leaderboard error:", error);
            setLeaders([]);
        }
        setLoading(false);
    };

    const getRankIcon = (index) => {
        if (index === 0) return <Crown size={24} className="text-yellow-400" />;
        if (index === 1) return <Medal size={24} className="text-gray-300" />;
        if (index === 2) return <Medal size={24} className="text-orange-400" />;
        return null;
    };

    const getRankStyle = (index) => {
        if (index === 0) return 'bg-gradient-to-br from-yellow-500/20 to-orange-600/10 border-yellow-500/30';
        if (index === 1) return 'bg-gradient-to-br from-gray-500/20 to-gray-600/10 border-gray-500/30';
        if (index === 2) return 'bg-gradient-to-br from-orange-500/20 to-red-600/10 border-orange-500/30';
        return 'bg-[#13151c] border-white/5';
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 pb-8 overflow-y-auto" style={{ height: '100vh' }}>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Trophy size={32} className="text-yellow-400" />
                        Leaderboard
                    </h1>
                    <p className="text-gray-400">Top Swachh Sathi volunteers making a difference</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && leaders.length === 0 && (
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl p-12 text-center">
                        <Trophy size={48} className="mx-auto mb-4 text-gray-500" />
                        <h3 className="text-xl font-semibold text-white mb-2">No users yet</h3>
                        <p className="text-gray-400">Be the first to join and climb the leaderboard!</p>
                    </div>
                )}

                {/* Top 3 Podium */}
                {!loading && leaders.length >= 3 && (
                    <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
                        {[1, 0, 2].map((index) => {
                            const leader = leaders[index];
                            if (!leader) return null;
                            return (
                                <div key={index} className={`rounded-2xl p-6 text-center ${getRankStyle(index)} border`}>
                                    <div className="relative inline-block mb-4">
                                        <img
                                            src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`}
                                            className={`w-20 h-20 rounded-full mx-auto ${index === 0 ? 'ring-4 ring-yellow-500/30' : ''}`}
                                            alt=""
                                        />
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                            {getRankIcon(index)}
                                        </div>
                                    </div>
                                    <p className="text-white font-semibold truncate">{leader.name}</p>
                                    <p className="text-gray-400 text-sm truncate">@{leader.username}</p>
                                    <div className="mt-3 bg-[#0a0b0f]/50 rounded-lg py-2 px-3">
                                        <p className="text-2xl font-bold text-green-400">{leader.credits || 0}</p>
                                        <p className="text-xs text-gray-500">credits</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Full Leaderboard */}
                {!loading && leaders.length > 0 && (
                    <div className="bg-[#13151c] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <TrendingUp size={20} className="text-green-400" />
                                All Rankings
                            </h3>
                            <span className="text-gray-500 text-sm">{leaders.length} volunteers</span>
                        </div>

                        <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                            {leaders.map((leader, index) => {
                                const isCurrentUser = leader._id === user?._id;
                                return (
                                    <div
                                        key={leader._id}
                                        className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-all ${isCurrentUser ? 'bg-green-500/10' : ''}`}
                                    >
                                        <div className="w-12 text-center">
                                            {index < 3 ? (
                                                getRankIcon(index)
                                            ) : (
                                                <span className="text-gray-500 font-medium">#{index + 1}</span>
                                            )}
                                        </div>
                                        <img
                                            src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`}
                                            className="w-12 h-12 rounded-full"
                                            alt=""
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium truncate">{leader.name}</p>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">You</span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm truncate">@{leader.username} • {leader.city || 'Unknown'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-400">{leader.credits || 0}</p>
                                            <p className="text-xs text-gray-500">credits</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Leaderboard;