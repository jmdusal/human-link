import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Globe, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface NetworkDataPoint {
    time: string;
    rtt: number;
    downlink: number;
}

export default function Overview() {
    const [history, setHistory] = useState<NetworkDataPoint[]>([]);
    const [currentStats, setCurrentStats] = useState({ rtt: 0, downlink: 0 });

    useEffect(() => {
        const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        const updateNetworkStats = () => {
        if (conn) {
            const newPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rtt: conn.rtt || 0, 
            downlink: conn.downlink || 0 
            };

            setCurrentStats({ rtt: conn.rtt || 0, downlink: conn.downlink || 0 });
            setHistory(prev => [...prev.slice(-19), newPoint]); 
        }
        };

        if (conn) {
            conn.addEventListener('change', updateNetworkStats);
        }

        updateNetworkStats();
        const interval = setInterval(updateNetworkStats, 2000); 

        return () => {
            if (conn) conn.removeEventListener('change', updateNetworkStats);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 text-sm font-medium">Real-time HumanLink node performance.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">Live Tracking</span>
                </div>
            </div>
        
            {/* Realtime stats from currentStats state */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OverviewStat label="Current Latency" value={`${currentStats.rtt} ms`} icon={<Zap size={20}/>} isUp={currentStats.rtt < 100} growth="Active" />
                <OverviewStat label="Est. Downlink" value={`${currentStats.downlink} Mbps`} icon={<Globe size={20}/>} isUp={currentStats.downlink > 5} growth="Active" />
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Network Reliability (Latency)</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    REAL-TIME DATA
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer
                    width="100%"
                    height="100%"
                    // minHeight={256}
                    initialDimension={{ width: 400, height: 256 }}
                    >
                        <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorRtt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} unit="ms" />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                        isAnimationActive={true}
                        type="monotone" 
                        dataKey="rtt" 
                        stroke="#3b82f6" 
                        fill="url(#colorRtt)" 
                        strokeWidth={3} 
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const OverviewStat = ({ label, value, icon, isUp, growth }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <div className="p-3 bg-slate-50 text-blue-600 rounded-2xl">{icon}</div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                
                {growth}
            </span>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
);