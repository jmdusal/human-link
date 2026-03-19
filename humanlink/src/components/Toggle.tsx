interface ToggleOption {
    label: string;
    value: string;
}

interface ToggleProps {
    label?: string;
    value: string;
    options: readonly ToggleOption[] | ToggleOption[];
    onChange: (newValue: string) => void;
}

export default function Toggle({ label, value, options, onChange }: ToggleProps) {
    const isActive = value === options[0].value;

    const handleToggle = () => {
        const newValue = isActive ? options[1].value : options[0].value;
        onChange(newValue);
    };

    return (
        <div className="space-y-2 text-left">
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] opacity-80">
                    {label}
                </label>
            )}
            
            <button
                type="button"
                onClick={handleToggle}
                className="flex items-center gap-3 py-1 group outline-none"
            >
                <div className={`
                    relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full 
                    transition-all duration-300 ease-in-out
                    ${isActive ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-slate-200'}
                `}>
                    <span className={`
                        pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white 
                        shadow-sm transition duration-300 ease-in-out
                        ${isActive ? 'translate-x-4' : 'translate-x-0.5'}
                    `} />
                </div>
                
                <span className={`
                    text-[11px] font-bold tracking-wide transition-colors cursor-pointer
                    ${isActive ? 'text-blue-600' : 'text-slate-400'}
                    group-hover:opacity-80
                `}>
                    {isActive ? options[0].label.toUpperCase() : options[1].label.toUpperCase()}
                </span>
            </button>
        </div>
    );
}