import { Plus, Save, XCircle } from 'lucide-react';

function FieldActions({ isUnique, onUniqueChange, isEditing, onCancel, onSubmit }) {
    return (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#30363d]">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isUnique}
                    onChange={(e) => onUniqueChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-[#0d1117] text-blue-600 focus:ring-offset-[#161b22]"
                />
                <span className="text-xs font-medium">Unique Value</span>
            </label>

            <div className="flex gap-2">
                {isEditing && (
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1"
                    >
                        <XCircle size={14} /> Cancel
                    </button>
                )}
                <button
                    onClick={onSubmit}
                    className={`text-white px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition shadow-md border border-[rgba(240,246,252,0.1)] ${isEditing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#238636] hover:bg-[#2ea043]'
                        }`}
                >
                    {isEditing ? <Save size={16} /> : <Plus size={16} />}
                    {isEditing ? 'Update Field' : 'Add Field'}
                </button>
            </div>
        </div>
    );
}

export default FieldActions;