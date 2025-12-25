import { useState, useRef } from 'react';
import { Thermometer, Sliders, AlertTriangle, Braces, Link2 } from 'lucide-react';
import { colors } from '../../../theme';

function LLMParams({ params, onChange, context }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const textAreaRef = useRef(null);
    const { existingFields, currentFieldName, tables } = context;

    const getAvailableVariables = () => {
        const vars = [];
        existingFields.filter(f => f.name !== currentFieldName).forEach(f => {
            vars.push({ name: f.name, type: 'local', desc: 'Current Table' });
            if (f.type === 'foreign_key' && f.params && f.params.table_id) {
                const connectedTable = tables.find(t => t.id === f.params.table_id);
                if (connectedTable) {
                    connectedTable.fields.forEach(remoteField => {
                        vars.push({ name: `${f.name}.${remoteField.name}`, type: 'remote', desc: `from ${connectedTable.name}` });
                    });
                }
            }
        });
        return vars;
    };
    const availableVars = getAvailableVariables();

    const insertVariable = (variable) => {
        const toInsert = `{${variable}}`;
        if (textAreaRef.current) {
            const startPos = textAreaRef.current.selectionStart;
            const endPos = textAreaRef.current.selectionEnd;
            const text = params.prompt_template || "";
            const newText = text.substring(0, startPos) + toInsert + text.substring(endPos);
            onChange({ prompt_template: newText });
            setTimeout(() => {
                textAreaRef.current.focus();
                textAreaRef.current.setSelectionRange(startPos + toInsert.length, startPos + toInsert.length);
            }, 0);
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Prompt Template</label>
                <textarea
                    ref={textAreaRef}
                    value={params.prompt_template || ""}
                    onChange={e => onChange({ prompt_template: e.target.value })}
                    placeholder="e.g. Generate a name..."
                    className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm h-24 font-mono text-xs focus:border-blue-500 outline-none`}
                />

                {availableVars.length > 0 && (
                    <div className="mt-2">
                        <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mb-1.5"><Braces size={10} /> Insert Variable:</label>
                        <div className="flex flex-wrap gap-1.5">
                            {availableVars.map((v, i) => (
                                <button key={i} onClick={() => insertVariable(v.name)} className={`text-[10px] px-2 py-0.5 rounded border transition flex items-center gap-1.5 ${v.type === 'remote' ? 'bg-purple-900/20 border-purple-800 text-purple-300 hover:bg-purple-900/40' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`} title={`Insert {${v.name}} from ${v.desc}`}>
                                    <span className="font-mono">{`{${v.name}}`}</span>
                                    {v.type === 'remote' && <Link2 size={8} className="opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                    <label className={`flex items-center gap-1 text-xs font-bold ${colors.textMuted}`}><Thermometer size={12} /> Temperature</label>
                    <span className="text-xs font-mono text-blue-400">{params.temperature ?? 1.0}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" value={params.temperature ?? 1.0} onChange={(e) => onChange({ temperature: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            {params.temperature < 0.5 && (
                <div className="flex items-start gap-2 p-2 rounded bg-yellow-900/20 border border-yellow-700/50 text-yellow-500 text-[10px]">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                    <div><span className="font-bold">Warning:</span> Low temperature may cause duplicates.</div>
                </div>
            )}

            <div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition mt-2"><Sliders size={10} /> {showAdvanced ? "Hide" : "Show"} Advanced Parameters</button>
                {showAdvanced && (
                    <div className="mt-3 space-y-3 p-3 bg-black/20 rounded border border-[#30363d]">
                        <div><label className={`text-[10px] font-bold ${colors.textMuted}`}>Top P: {params.top_p ?? 1.0}</label><input type="range" min="0" max="1" step="0.05" value={params.top_p ?? 1.0} onChange={(e) => onChange({ top_p: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500" /></div>
                        <div><label className={`text-[10px] font-bold ${colors.textMuted}`}>Freq. Penalty: {params.frequency_penalty ?? 0.0}</label><input type="range" min="0" max="2" step="0.1" value={params.frequency_penalty ?? 0.0} onChange={(e) => onChange({ frequency_penalty: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500" /></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LLMParams;