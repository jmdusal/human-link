import { useState } from 'react';
import { User as UserIcon, LayoutGrid, List, UserPlus } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import MultiSelect from '@/components/ui/MultiSelect';
import Card from '@/components/ui/Card';
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

function roleBadgeClass(role?: string) {
    if (role === 'owner') return 'bg-slate-900 border-slate-800 text-white';
    if (role === 'admin') return 'bg-blue-50 border-blue-200 text-blue-700';
    return 'bg-slate-50 border-slate-200 text-slate-600';
}

export default function MembersTab({ data, userOptions, searchQuery, setSearchQuery, onUpdateMembers }: MembersTabProps) {
    usePageTitle('Workspace Members');
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
                        role: nextRole,
                    },
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
    const memberCount = data.members?.length || 0;

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Team Members</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Managing {memberCount} collaborators in {data.name}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            aria-label="Grid view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            aria-label="List view"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <Searchbar
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search team members..."
                    />
                </div>
            </div>

            {isWorkspaceAdminOrOwner && (
                <Card variant="section" className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <UserPlus size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">Invite or Manage Team</h4>
                                <p className="text-sm text-slate-400 font-medium mt-0.5">
                                    Search people to add. Click a role chip to switch between member and admin.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center self-start px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            {memberCount} members
                        </span>
                    </div>

                    <MultiSelect
                        placeholder="Search users to invite..."
                        options={userOptions}
                        selectedValues={data.members || []}
                        lockedIds={currentOwnerId ? [currentOwnerId] : []}
                        showRole={true}
                        showInitials={true}
                        onChange={(selectedItems) => {
                            const fullMemberData = selectedItems.map((item) => {
                                const fullUser = userOptions.find((u) => u.id === item.id);
                                return {
                                    ...item,
                                    email: item.email || fullUser?.email,
                                    status: item.status || fullUser?.status || 'active',
                                    pivot: item.pivot || { role: 'member' },
                                };
                            });
                            onUpdateMembers(fullMemberData);
                        }}
                    />
                </Card>
            )}

            <div className="flex-1">
                {paginatedMembers.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedMembers.map((member: any) => {
                                const role = member.pivot?.role || 'member';
                                const isOwner = member.id === currentOwnerId || role === 'owner';

                                return (
                                    <Card
                                        key={member.id}
                                        hover
                                        className="group flex flex-col h-full"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-5">
                                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {getInitials(member.name)}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isOwner}
                                                onClick={() => handleToggleRole(member.id)}
                                                className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border transition-colors shrink-0 ${roleBadgeClass(role)} ${
                                                    isOwner ? 'cursor-default' : 'hover:opacity-90'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        </div>

                                        <h4 className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">
                                            {member.name}
                                        </h4>
                                        <p className="text-[13px] text-slate-500 font-medium truncate mt-1">
                                            {member.email || 'No email'}
                                        </p>

                                        <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100">
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {isOwner ? 'Full access' : 'Workspace access'}
                                            </span>
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                                                    member.status === 'active' || !member.status
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                                }`}
                                            >
                                                {member.status || 'Active'}
                                            </span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="!p-0 overflow-hidden">
                            <div className="px-6 py-3 bg-slate-50/80 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <div className="flex-[1.4]">Member</div>
                                <div className="flex-1 text-center">Role</div>
                                <div className="flex-1 text-center">Status</div>
                            </div>

                            {paginatedMembers.map((member: any) => {
                                const role = member.pivot?.role || 'member';
                                const isOwner = member.id === currentOwnerId || role === 'owner';

                                return (
                                    <div
                                        key={member.id}
                                        className="px-6 py-3.5 flex items-center border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                                    >
                                        <div className="flex-[1.4] flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                                                {getInitials(member.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex justify-center">
                                            <button
                                                type="button"
                                                disabled={isOwner}
                                                onClick={() => handleToggleRole(member.id)}
                                                className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border transition-colors ${roleBadgeClass(role)} ${
                                                    isOwner ? 'cursor-default' : 'hover:opacity-90'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        </div>

                                        <div className="flex-1 flex justify-center">
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                                                    member.status === 'active' || !member.status
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                                }`}
                                            >
                                                {member.status || 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </Card>
                    )
                ) : (
                    <Card className="flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
                            <UserIcon size={24} className="text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                            {searchQuery ? 'No matches found' : 'No members yet'}
                        </h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-[260px] text-center font-medium leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any members matching "${searchQuery}"`
                                : 'Invite people above to start collaborating in this workspace.'}
                        </p>
                    </Card>
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
        </div>
    );
}
