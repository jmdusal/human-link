import FormLabel from '@/components/ui/FormLabel';

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
    // Assuming options[0] is the "active/on" state
    const isActive = value === options[0].value;

    const handleToggle = () => {
        const newValue = isActive ? options[1].value : options[0].value;
        onChange(newValue);
    };

    return (
        <div className="space-y-1.5 text-left group">
            {label && <FormLabel>{label}</FormLabel>}
            
            <button
                type="button"
                onClick={handleToggle}
                className="flex items-center gap-2.5 py-1 outline-none cursor-pointer"
            >
                {/* The Track */}
                <div className={`
                    relative inline-flex h-5 w-9 shrink-0 items-center rounded-full 
                    transition-colors duration-200 ease-in-out
                    ${isActive ? 'bg-blue-600' : 'bg-slate-200 hover:bg-slate-300'}
                `}>
                    {/* The Thumb */}
                    <span className={`
                        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white 
                        shadow-sm ring-0 transition duration-200 ease-in-out
                        ${isActive ? 'translate-x-4.5' : 'translate-x-0.5'}
                    `} />
                </div>
                
                {/* The Label */}
                <span className={`
                    text-sm font-medium transition-colors
                    ${isActive ? 'text-slate-900' : 'text-slate-500'}
                `}>
                    {isActive ? options[0].label : options[1].label}
                </span>
            </button>
        </div>
    );
}