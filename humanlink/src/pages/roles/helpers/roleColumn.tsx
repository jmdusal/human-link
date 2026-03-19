import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Clock } from 'lucide-react';
import type { Role } from '@/types/models';

const columnHelper = createColumnHelper<Role>();

interface RoleColumnProps {
    openDropdown: number | null;
    setOpenDropdown: (id: number | null) => void;
    can: (permission: string) => boolean;
    handleEdit: (role: Role) => void;
    handleDeleteClick: (role: Role) => void;
}

export const getRoleColumns = (props: RoleColumnProps): ColumnDef<Role, any>[] => [
    columnHelper.accessor('name', {
        header: 'Role Name',
        cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('permissions' as any, {
        header: 'Permissions',
        cell: (info) => {
            const permissions = (info.row.original as any).permissions || [];
            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {permissions.map((p: any) => (
                        <span
                            key={p.id}
                            className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-50/50 border border-slate-200/60 rounded-md tracking-tight hover:bg-slate-100 transition-colors"
                        >
                            {p.name.replace('-', ' ')} 
                        </span>
                    ))}
                </div>
            );
        }
    }),

    columnHelper.accessor('created_at', {
        header: 'Timestamp',
        cell: (info) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                <span>{new Date(info.getValue()).toLocaleString()}</span>
            </div>
        ),
    }),

    columnHelper.display({
        id: 'actions',
        cell: (info) => {
            const { openDropdown, setOpenDropdown, can, handleEdit, handleDeleteClick } = props;
            const role = info.row.original;

            return (
                <div style={{ position: 'relative', textAlign: 'right' }}>
                    <button onClick={() => setOpenDropdown(openDropdown === role.id ? null : role.id)}>
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {openDropdown === role.id && (
                        <div style={{ position: 'absolute', right: 0, zIndex: 50, background: 'white', border: '1px solid #e2e8f0' }}>
                            {can('role-edit') && (
                                <button onClick={() => handleEdit(role)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    <Pencil size={14} className="text-amber-500" /> Edit
                                </button>
                            )}
                            {can('role-delete') && (
                                <button onClick={() => handleDeleteClick(role)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );
        },
    }),
];