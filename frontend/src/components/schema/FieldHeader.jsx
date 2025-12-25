import { colors } from '../../theme';

function FieldHeader({ name, type, isEditing, onNameChange, onTypeChange }) {
    return (
        <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="col-span-2">
                <label className={`block text-[10px] uppercase font-bold ${colors.textMuted} mb-1`}>
                    {isEditing ? 'Editing Field Name' : 'Field Name'}
                </label>
                <input
                    type="text"
                    placeholder="e.g. user_id"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    className={`w-full p-2 rounded-md ${colors.bgPanel} border ${colors.border} text-sm text-white focus:border-blue-500 outline-none`}
                />
            </div>
            <div className="col-span-1">
                <label className={`block text-[10px] uppercase font-bold ${colors.textMuted} mb-1`}>Type</label>
                <select
                    value={type}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className={`w-full p-2 rounded-md ${colors.bgPanel} border ${colors.border} text-sm text-white focus:border-blue-500 outline-none`}
                >
                    <option value="faker">Faker</option>
                    <option value="llm">AI / LLM</option>
                    <option value="template">Derived / Logic</option>
                    <option value="integer">Number (Int)</option>
                    <option value="boolean">Boolean</option>
                    <option value="regex">Regex Pattern</option>
                    <option value="timestamp">Timestamp</option>
                    <option value="distribution">Distro</option>
                    <option value="foreign_key">Relation (FK)</option>
                </select>
            </div>
        </div>
    );
}

export default FieldHeader;