import { useState, useRef, useEffect } from 'react';
import {
    ChevronDown, Check,
    Wand2, LayoutTemplate, PieChart,
    Type, Hash, ToggleLeft, Calendar, FileCode,
    Link2
} from 'lucide-react';
import { colors } from '../../theme';

const TYPE_OPTIONS = [
    {
        group: "AI & Logic",
        items: [
            { value: "llm", label: "AI Generation", icon: Wand2, desc: "GPT-4o creative content", color: "text-purple-400" },
            { value: "template", label: "Derived / Logic", icon: LayoutTemplate, desc: "Combine fields (Jinja2)", color: "text-green-400" },
            { value: "distribution", label: "Distribution", icon: PieChart, desc: "Weighted random options", color: "text-orange-400" },
        ]
    },
    {
        group: "Standard Data",
        items: [
            { value: "faker", label: "Faker Library", icon: Type, desc: "Real-world data (names, address)", color: "text-blue-400" },
            { value: "integer", label: "Number", icon: Hash, desc: "Range of numbers", color: "text-indigo-400" },
            { value: "boolean", label: "Boolean", icon: ToggleLeft, desc: "True / False flag", color: "text-indigo-400" },
            { value: "timestamp", label: "Timestamp", icon: Calendar, desc: "Date & Time range", color: "text-cyan-400" },
            { value: "regex", label: "Regex Pattern", icon: FileCode, desc: "Match specific pattern", color: "text-pink-400" },
        ]
    },
    {
        group: "Relational",
        items: [
            { value: "foreign_key", label: "Foreign Key", icon: Link2, desc: "Link to another table", color: "text-yellow-400" },
        ]
    }
];

function TypeSelector({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = TYPE_OPTIONS.flatMap(g => g.items).find(i => i.value === value) || TYPE_OPTIONS[1].items[0];
    const SelectedIcon = selectedOption.icon;

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-2 rounded-md border ${colors.border} bg-[#0d1117] text-left flex items-center justify-between hover:border-gray-500 transition group`}
            >
                <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded bg-gray-800 ${selectedOption.color}`}>
                        <SelectedIcon size={14} />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-sm text-gray-200 font-medium">{selectedOption.label}</span>
                    </div>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl z-50 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100 origin-top-left w-[280px] md:w-[320px]">
                    {TYPE_OPTIONS.map((group, groupIdx) => (
                        <div key={group.group} className={groupIdx !== 0 ? "border-t border-[#30363d]" : ""}>
                            <div className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-[#0d1117]/50">
                                {group.group}
                            </div>
                            <div className="p-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = item.value === value;
                                    return (
                                        <button
                                            key={item.value}
                                            onClick={() => {
                                                onChange(item.value);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-start gap-3 p-2 rounded-md transition ${isSelected
                                                ? 'bg-blue-900/20'
                                                : 'hover:bg-[#21262d]'
                                                }`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded ${isSelected ? 'bg-blue-900/40 text-blue-400' : `bg-gray-800/50 ${item.color}`}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className={`text-xs font-semibold flex items-center justify-between ${isSelected ? 'text-blue-300' : 'text-gray-200'}`}>
                                                    {item.label}
                                                    {isSelected && <Check size={12} />}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                                    {item.desc}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TypeSelector;