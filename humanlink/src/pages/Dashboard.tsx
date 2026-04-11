import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import TopHeader from '../components/layouts/TopHeader';
import { MoreVertical, Plus, ArrowUpRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Dashboard({ children }: LayoutProps) {
    return (
        <div className="flex h-screen bg-[#F0F2F5] text-slate-700 font-sans overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader />
                
                <main className="flex-1 overflow-y-auto p-8">
                    {children} 
                </main>
            </div>
        </div>
    );
};

// const StatCard = ({ label, value, growth, color }: any) => (
//   <div className="bg-white p-6 rounded-3xl border border-white shadow-lg shadow-slate-200/60 relative overflow-hidden group">
//     <div className="absolute right-[-10%] top-[-10%] h-24 w-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
//     <p className="text-slate-400 text-xs font-bold uppercase mb-1 relative z-10">{label}</p>
//     <div className="flex items-end gap-3 relative z-10">
//       <span className={`text-3xl font-black tracking-tight ${color}`}>{value}</span>
//       <span className="text-[10px] font-bold text-green-500 pb-1 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
//         {growth} <ArrowUpRight size={10} className="ml-0.5" />
//       </span>
//     </div>
//   </div>
// );

// const TableRow = ({ name, role, status, strength }: any) => (
//   <tr className="hover:bg-slate-50/50 transition-colors group">
//     <td className="px-6 py-4 font-semibold text-slate-700 text-sm">{name}</td>
//     <td className="px-6 py-4 text-slate-500 text-xs">{role}</td>
//     <td className="px-6 py-4">
//       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
//         status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
//       }`}>
//         {status}
//       </span>
//     </td>
//     <td className="px-6 py-4">
//       <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
//         <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: strength }} />
//       </div>
//     </td>
//     <td className="px-6 py-4 text-right">
//       <button className="text-slate-300 group-hover:text-slate-600 transition-colors"><MoreVertical size={18}/></button>
//     </td>
//   </tr>
// );