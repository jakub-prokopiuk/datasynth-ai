import { colors } from '../../theme';
import TypeSelector from './TypeSelector';

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
                    className={`w-full p-2.5 rounded-md ${colors.bgPanel} border ${colors.border} text-sm text-white focus:border-blue-500 outline-none h-[42px]`}
                />
            </div>
            <div className="col-span-1">
                <label className={`block text-[10px] uppercase font-bold ${colors.textMuted} mb-1`}>Type</label>

                <TypeSelector
                    value={type}
                    onChange={onTypeChange}
                />
            </div>
        </div>
    );
}

export default FieldHeader;