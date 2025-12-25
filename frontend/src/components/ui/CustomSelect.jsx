import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { colors } from '../../theme';

function CustomSelect({ value, onChange, options, placeholder = "Select...", disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-2 rounded-md border ${colors.border} bg-[#0d1117] text-left flex items-center justify-between hover:border-gray-500 transition group`}
                type="button"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selectedOption?.icon && (
                        <selectedOption.icon size={14} className="text-gray-400 shrink-0" />
                    )}
                    <span className={`text-sm truncate ${selectedOption ? 'text-gray-200' : 'text-gray-500'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl z-50 max-h-[250px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition ${isSelected
                                            ? 'bg-blue-900/20 text-blue-300'
                                            : 'text-gray-300 hover:bg-[#21262d] hover:text-white'
                                        }`}
                                >
                                    {Icon && <Icon size={14} className={isSelected ? 'text-blue-400' : 'text-gray-500'} />}
                                    <span className="text-xs font-medium flex-1 truncate">{option.label}</span>
                                    {isSelected && <Check size={12} />}
                                </button>
                            );
                        })}
                        {options.length === 0 && (
                            <div className="p-2 text-xs text-gray-500 text-center">No options</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomSelect;