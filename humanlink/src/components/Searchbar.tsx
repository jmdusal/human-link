import { Search } from 'lucide-react';

interface SearchbarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function Searchbar({ value, onChange, placeholder = "Search...", }: SearchbarProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} 
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:ring-4 ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all text-sm text-slate-600 placeholder:text-slate-400" 
                />
            </div>
        </div>
    );
}