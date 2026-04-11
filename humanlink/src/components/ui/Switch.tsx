interface SwitchProps {
    label?: string;
    description?: string;
    checked: boolean | number;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

export default function Switch({ label, description, checked, onChange, disabled }: SwitchProps) {
    const isChecked = !!checked;

    const handleToggle = () => {
        const nextValue = !isChecked;
        
        // console.log(`[Switch: ${label}] Toggle Changed:`, {
        //     from: isChecked,
        //     to: nextValue,
        //     asNumber: nextValue ? 1 : 0
        // });

        onChange(nextValue);
    };

    return (
        <div className="flex items-center justify-between gap-4 py-2">
            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <label 
                            onClick={handleToggle}
                            className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                        >
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                disabled={disabled}
                onClick={handleToggle}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                    ${isChecked ? 'bg-blue-600' : 'bg-slate-200'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                        transition duration-200 ease-in-out
                        ${isChecked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}