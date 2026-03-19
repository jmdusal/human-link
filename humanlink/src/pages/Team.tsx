import React from 'react';
import Button from '../components/Button';
import { Plus, Search, MoreHorizontal, Shield} from 'lucide-react';

export default function Team() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Team Portal</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage node operators and access levels.</p>
                </div>
                {/* <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center gap-2">
                <Plus size={18} /> Invite Member
                </button> */}
                <Button variant="primary" icon={Plus}>
                    Invite Member
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Filter by name or role..." className="w-full bg-white border border-white shadow-sm rounded-2xl py-3 pl-12 pr-4 focus:ring-2 ring-blue-500/20 outline-none transition-all" />
                </div>
                <button className="px-6 bg-white border border-white shadow-sm rounded-2xl font-bold text-slate-500 hover:text-blue-600 transition-colors">Filters</button>
            </div>

            {/* Modern Table */}
            <div className="bg-white rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                <tr>
                    <th className="px-8 py-5">User Identity</th>
                    <th className="px-8 py-5">Access Level</th>
                    <th className="px-8 py-5">Activity</th>
                    <th className="px-8 py-5 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    <TeamRow name="JM Michael" email="jm@humanlink.io" role="Super Admin" status="Active" color="bg-blue-500" />
                    <TeamRow name="Sarah Chen" email="s.chen@dev.io" role="Developer" status="Online" color="bg-purple-500" />
                    <TeamRow name="Alex Rivera" email="arivera@sec.io" role="Security" status="Offline" color="bg-slate-400" />
                </tbody>
                </table>
            </div>
        </div>
    );
};

const TeamRow = ({ name, email, role, status, color }: any) => (
    <tr className="group hover:bg-slate-50/50 transition-colors">
        <td className="px-8 py-5">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 ${color} rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-slate-100`}>
                    {name.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-sm">{name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{email}</p>
                </div>
            </div>
        </td>
        <td className="px-8 py-5">
            <div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                <Shield size={12} className="text-blue-600" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{role}</span>
            </div>
        </td>
        <td className="px-8 py-5">
            <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${status === 'Offline' ? 'bg-slate-300' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-xs font-bold text-slate-500">{status}</span>
            </div>
        </td>
        <td className="px-8 py-5 text-right">
            <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <MoreHorizontal size={20} />
            </button>
        </td>
    </tr>
);