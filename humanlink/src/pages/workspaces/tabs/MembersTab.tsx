import { useState } from 'react';
import { User as UserIcon, Activity, LayoutGrid, List, ArrowUpRight } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import MultiSelect from '@/components/ui/MultiSelect';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/userUtils';
import Pagination from '@/components/shared/ModalTabPagination';
import { usePageTitle } from '@/hooks/use-title';

interface MembersTabProps {
    data: any;
    userOptions: any[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onUpdateMembers: (newMembers: any[]) => void;
}

export default function MembersTab({ data, userOptions, searchQuery, setSearchQuery, onUpdateMembers }: MembersTabProps) {
    usePageTitle("Workspace Members")
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const itemsPerPage = viewMode === 'grid' ? 8 : 10;
    
    const workspaceRole = data.members.find((m: any) => m.id === user?.id)?.pivot?.role;
    const isWorkspaceAdminOrOwner = workspaceRole === 'owner' || workspaceRole === 'admin';

    const handleToggleRole = (userId: number) => {
        const ownerId = data.ownerId;
        if (userId === ownerId) return;

        const updatedMembers = data.members.map((member: any) => {
            if (member.id === userId) {
                const currentRole = member.pivot?.role || 'member';
                const nextRole = currentRole === 'member' ? 'admin' : 'member';
                return {
                    ...member,
                    pivot: {
                        ...(member.pivot || {}),
                        role: nextRole 
                    }
                };
            }
            return member;
        });

        onUpdateMembers(updatedMembers);
    };

    const filteredMembers = (data.members || []).filter((member: any) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

    const currentOwnerId = data.owner_id || data.ownerId;
    
    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Team Members</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Managing {data.members?.length || 0} collaborators in {data.name}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 mr-2">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                
                    <Searchbar 
                        value={searchQuery} 
                        onChange={handleSearch}
                        // onChange={setSearchQuery}
                        placeholder="Search team members..." 
                    />
                </div>
            </div>
            
            {isWorkspaceAdminOrOwner && (
                <div className="mb-8 p-6 bg-white rounded-[15px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="max-w-1xl">
                        <MultiSelect
                            label="Invite or Manage Team"
                            helperText="Elevate member roles by interacting with the status badge."
                            placeholder="Search users to add..."
                            options={userOptions}
                            selectedValues={data.members || []}
                            lockedIds={currentOwnerId ? [currentOwnerId] : []}
                            // onChange={onUpdateMembers}
                            onChange={(selectedItems) => {
                                const fullMemberData = selectedItems.map(item => {
                                    const fullUser = userOptions.find(u => u.id === item.id);
                                    
                                    // console.log('selected item test', item);
                                    return {
                                        ...item,
                                        email: item.email || fullUser?.email,
                                        status: item.status || fullUser?.status || 'active',
                                        pivot: item.pivot || { role: 'member' }
                                    };
                                });
                                onUpdateMembers(fullMemberData);
                            }}
                            showRole={true}
                        />
                    </div>
                </div> 
            )}
            
            
            <div className="flex-1">
                {paginatedMembers.length > 0 ? (
                    // GRID VIEW
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                            {paginatedMembers.map((member: any) => (
                                <div
                                    key={member.id}
                                    className="group relative flex flex-col h-full p-6 rounded-2xl bg-white border border-slate-200/60 
                                    transition-all duration-300 ease-in-out shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] 
                                    hover:border-blue-500/30 hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative flex-1 flex flex-col z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            {/* Member Avatar/Icon */}
                                            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 ring-4 ring-transparent group-hover:ring-blue-50">
                                                <UserIcon size={20} strokeWidth={2.5} />
                                            </div>

                                            {/* Role Badge - Re-styled for Pro Look */}
                                            <Button
                                                type="button"
                                                variant={member.pivot?.role === 'admin' ? 'primary' : 'secondary'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleRole(member.id);
                                                }}
                                                disabled={member.id === currentOwnerId}
                                                className={`!rounded-full !px-3 !py-1 !gap-1.5 !text-[10px] !font-bold uppercase tracking-widest transition-all active:scale-95 !border shadow-sm ${
                                                    member.pivot?.role === 'owner'
                                                        ? '!bg-slate-900 !border-slate-800 !text-white'
                                                        : member.pivot?.role === 'admin'
                                                            ? '!bg-blue-600 !border-blue-500 !text-white hover:!bg-blue-700'
                                                            : '!bg-white !text-slate-600 !border-slate-200 hover:!bg-slate-50'
                                                }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    (member.pivot?.role === 'owner' || member.pivot?.role === 'admin') 
                                                        ? 'bg-white' 
                                                        : 'bg-emerald-500 animate-pulse'
                                                }`} />
                                                {member.pivot?.role || 'Member'}
                                            </Button>
                                        </div>

                                        <h4 className="text-[17px] font-semibold text-slate-900 mb-1 tracking-tight">
                                            {member.name}
                                        </h4>

                                        <div className="flex-1">
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed truncate group-hover:text-blue-600/80 transition-colors">
                                                {member.email}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center justify-between py-3 px-3 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Access Level</span>
                                                <span className="text-[11px] font-semibold text-slate-700 capitalize">
                                                    {member.pivot?.role === 'owner' ? 'Full System Control' : 'Workspace access'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative mt-6 pt-5 flex items-center justify-between border-t border-slate-100/80 z-10">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Activity size={14} className="group-hover:text-blue-500 transition-colors" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {member.status || 'Active Now'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                                                <ArrowUpRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // LIST VIEW
                        <div className="flex flex-col gap-px bg-slate-200/50 rounded-2xl border border-slate-200/60 overflow-hidden">
                            <div className="px-6 py-3 bg-slate-50/80 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200/60">
                                <div className="flex-[1]">Member</div>
                                <div className="flex-1 text-center">Workspace Access</div>
                                <div className="flex-1 text-center">Status</div>
                                {/* <div className="w-10"></div> */}
                            </div>

                            {paginatedMembers.map((member: any) => (
                                <div 
                                    key={member.id}
                                    className="group bg-white px-6 py-3.5 flex items-center hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                >
                                    <div className="flex-[1] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200">
                                            {/* {member.name.charAt(0)} */}
                                            
                                            {getInitials(member.name)}
                                            
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900">{member.name}</span>
                                            <span className="text-[11px] text-slate-400 font-medium">{member.email}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex justify-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border transition-colors
                                            ${member.pivot?.role === 'owner' 
                                                ? 'bg-slate-900 border-slate-800 text-white' 
                                                : member.pivot?.role === 'admin'
                                                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm shadow-blue-100'
                                                    : 'bg-white border-slate-200 text-slate-600'
                                            }`}>
                                            {member.pivot?.role}
                                        </span>
                                    </div>


                                    {/* <div className="flex-1 flex justify-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border transition-colors
                                            ${member.pivot?.role === 'owner' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
                                            {member.pivot?.role}
                                        </span>
                                    </div> */}

                                    <div className="flex-1 flex justify-center">
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border
                                            ${member.status === 'active' ? 'bg-emerald-400/10 border-emerald-200/50 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                            {member.status}
                                        </div>
                                    </div>

                                    {/* <div className="w-10 flex justify-end">
                                        <Settings size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                                    </div> */}
                                </div>
                            ))}
                        </div>

                    )
                ) : (
                   <div className="flex flex-col items-center justify-center py-32 rounded-[40px] bg-slate-50/30">
                        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                            <UserIcon size={28} className="text-slate-200" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                            {searchQuery ? 'No matches found' : 'Initialize Workspace Member'}
                        </h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-[240px] text-center font-medium leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any members matching "${searchQuery}"` 
                                : 'Start adding members to organize your workspace.'
                            }
                        </p>
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="mt-10">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredMembers.length} 
                    />
                </div>
            )}
            
            
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                {filteredMembers.map((member: any) => (
                    <div
                        key={member.id}
                        className="group relative flex flex-col p-6 rounded-[32px] bg-white hover:bg-slate-50/80 transition-all duration-500 ease-out cursor-pointer border border-transparent hover:border-slate-100"
                    >
                        <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] pointer-events-none" />

                        <div className="relative">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-12 h-12 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all duration-500 shadow-sm border border-transparent group-hover:border-slate-100">
                                    <UserIcon size={22} />
                                </div>
                                
                                <Button
                                    type="button"
                                    variant={member.pivot?.role === 'admin' ? 'primary' : 'secondary'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleRole(member.id);
                                    }}
                                    disabled={member.id === currentOwnerId}
                                    className={`!rounded-full !px-2.5 !py-1 !gap-1.5 !text-[10px] !font-bold uppercase tracking-wider transition-all active:scale-95 ${
                                        member.pivot?.role === 'owner'
                                            ? '!bg-slate-900 !border-slate-800 !text-white'
                                            : member.pivot?.role === 'admin'
                                                ? '!bg-blue-600 !border-blue-700 !text-white'
                                                : '!bg-emerald-50 !text-emerald-600 !border-emerald-100'
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        (member.pivot?.role === 'owner' || member.pivot?.role === 'admin') 
                                            ? 'bg-white' 
                                            : 'bg-emerald-500'
                                    }`} />
                                    {member.pivot?.role || 'Member'}
                                </Button>

                            </div>

                            <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:translate-x-1 transition-transform duration-300">
                                {member.name}
                            </h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed truncate">
                                {member.email}
                            </p>

                        </div>

                        <div className="relative mt-8 pt-6 flex items-center justify-between border-t border-slate-50 group-hover:border-slate-100 transition-colors">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Activity size={14} className="group-hover:text-blue-500 transition-colors" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">{member.status}</span>
                            </div>

                            <button 
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Settings size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div> */}
        </div>
    );
}