import { useState, useEffect, useRef } from 'react';
import { Wand2, Plus, Save, XCircle, Thermometer, Sliders, AlertTriangle, Link2, Braces, Hash, ToggleLeft, Regex, Calendar } from 'lucide-react';
import { colors } from '../theme';

function SchemaBuilder({ onAddField, onUpdateField, onCancelEdit, existingFields, fieldToEdit, tables, activeTableId }) {
    const [newField, setNewField] = useState({
        name: "",
        type: "faker",
        is_unique: false,
        dependencies: []
    });

    const [fakerMethod, setFakerMethod] = useState("uuid4");

    const [llmPrompt, setLlmPrompt] = useState("");
    const [llmTemperature, setLlmTemperature] = useState(1.0);
    const [llmTopP, setLlmTopP] = useState(1.0);
    const [llmFreqPenalty, setLlmFreqPenalty] = useState(0.0);
    const [llmPresPenalty, setLlmPresPenalty] = useState(0.0);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [distOptions, setDistOptions] = useState("BUG, FEATURE, DOCS");
    const [distWeights, setDistWeights] = useState("50, 30, 20");

    const [fkTargetTable, setFkTargetTable] = useState("");
    const [fkTargetColumn, setFkTargetColumn] = useState("");

    const [intMin, setIntMin] = useState(0);
    const [intMax, setIntMax] = useState(100);

    const [boolProb, setBoolProb] = useState(50);

    const [regexPattern, setRegexPattern] = useState("\\d{2}-\\d{3}"); // default postal code like pattern

    const [tsMin, setTsMin] = useState("-1y");
    const [tsMax, setTsMax] = useState("now");
    const [tsFormat, setTsFormat] = useState("%Y-%m-%d %H:%M:%S");

    const textAreaRef = useRef(null);

    useEffect(() => {
        if (fieldToEdit) {
            setNewField({
                name: fieldToEdit.name,
                type: fieldToEdit.type,
                is_unique: fieldToEdit.is_unique || false,
                dependencies: fieldToEdit.dependencies || []
            });

            const p = fieldToEdit.params || {};
            if (fieldToEdit.type === 'faker') {
                setFakerMethod(p.method || "uuid4");
            } else if (fieldToEdit.type === 'llm') {
                setLlmPrompt(p.prompt_template || "");
                setLlmTemperature(p.temperature ?? 1.0);
                setLlmTopP(p.top_p ?? 1.0);
                setLlmFreqPenalty(p.frequency_penalty ?? 0.0);
                setLlmPresPenalty(p.presence_penalty ?? 0.0);
            } else if (fieldToEdit.type === 'distribution') {
                setDistOptions(p.options ? p.options.join(", ") : "");
                setDistWeights(p.weights ? p.weights.join(", ") : "");
            } else if (fieldToEdit.type === 'foreign_key') {
                setFkTargetTable(p.table_id || "");
                setFkTargetColumn(p.column_name || "");
            } else if (fieldToEdit.type === 'integer') {
                setIntMin(p.min ?? 0);
                setIntMax(p.max ?? 100);
            } else if (fieldToEdit.type === 'boolean') {
                setBoolProb(p.probability ?? 50);
            } else if (fieldToEdit.type === 'regex') {
                setRegexPattern(p.pattern || "\\d{3}-[A-Z]{2}");
            } else if (fieldToEdit.type === 'timestamp') {
                setTsMin(p.min_date || "-1y");
                setTsMax(p.max_date || "now");
                setTsFormat(p.format || "%Y-%m-%d %H:%M:%S");
            }
        } else {
            resetForm();
        }
    }, [fieldToEdit]);

    const resetForm = () => {
        setNewField({ name: "", type: "faker", is_unique: false, dependencies: [] });
        setFakerMethod("uuid4");
        setLlmPrompt("");
        setLlmTemperature(1.0);
        setLlmTopP(1.0);
        setLlmFreqPenalty(0.0);
        setLlmPresPenalty(0.0);
        setShowAdvanced(false);
        setDistOptions("BUG, FEATURE, DOCS");
        setDistWeights("50, 30, 20");
        setFkTargetTable("");
        setFkTargetColumn("");
        setIntMin(0);
        setIntMax(100);
        setBoolProb(50);
        setRegexPattern("\\d{2}-\\d{3}");
        setTsMin("-1y");
        setTsMax("now");
        setTsFormat("%Y-%m-%d %H:%M:%S");
    };

    const handleSubmit = () => {
        if (!newField.name) return;

        let finalParams = {};
        if (newField.type === "faker") finalParams = { method: fakerMethod };
        else if (newField.type === "llm") finalParams = { prompt_template: llmPrompt, model: "gpt-4o-mini", temperature: parseFloat(llmTemperature), top_p: parseFloat(llmTopP), frequency_penalty: parseFloat(llmFreqPenalty), presence_penalty: parseFloat(llmPresPenalty) };
        else if (newField.type === "distribution") finalParams = { options: distOptions.split(",").map(s => s.trim()), weights: distWeights.split(",").map(s => parseFloat(s.trim())) };
        else if (newField.type === "foreign_key") finalParams = { table_id: fkTargetTable, column_name: fkTargetColumn };
        else if (newField.type === "integer") finalParams = { min: parseInt(intMin), max: parseInt(intMax) };
        else if (newField.type === "boolean") finalParams = { probability: parseInt(boolProb) };
        else if (newField.type === "regex") finalParams = { pattern: regexPattern };
        else if (newField.type === "timestamp") finalParams = { min_date: tsMin, max_date: tsMax, format: tsFormat };

        const fieldPayload = { ...newField, params: finalParams };

        if (fieldToEdit) onUpdateField(fieldPayload);
        else { onAddField(fieldPayload); resetForm(); }
    };

    const insertVariable = (variable) => {
        const toInsert = `{${variable}}`;
        if (textAreaRef.current) {
            const startPos = textAreaRef.current.selectionStart;
            const endPos = textAreaRef.current.selectionEnd;
            const text = llmPrompt;
            const newText = text.substring(0, startPos) + toInsert + text.substring(endPos);
            setLlmPrompt(newText);
            setTimeout(() => { textAreaRef.current.focus(); textAreaRef.current.setSelectionRange(startPos + toInsert.length, startPos + toInsert.length); }, 0);
        } else { setLlmPrompt(prev => prev + toInsert); }
    };

    const isDeterministicRisk = newField.type === 'llm' && llmTemperature < 0.5 && !newField.is_unique;
    const targetTableObj = tables.find(t => t.id === fkTargetTable);
    const targetColumns = targetTableObj ? targetTableObj.fields : [];

    const getAvailableVariables = () => {
        const vars = [];
        existingFields.filter(f => f.name !== newField.name).forEach(f => {
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

    return (
        <section className="flex-1">
            <h2 className={`text-xs font-bold ${colors.textMuted} uppercase tracking-wider flex items-center gap-2 mb-4`}>
                <Wand2 size={14} /> Schema Builder
            </h2>

            <div className={`p-4 rounded-md border ${colors.border} ${fieldToEdit ? 'bg-blue-900/10 border-blue-500/30' : 'bg-[#0d1117]'} mb-6 transition-colors`}>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="col-span-2">
                        <label className={`block text-[10px] uppercase font-bold ${colors.textMuted} mb-1`}>
                            {fieldToEdit ? 'Editing Field Name' : 'Field Name'}
                        </label>
                        <input type="text" placeholder="e.g. code" value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} className={`w-full p-2 rounded-md ${colors.bgPanel} border ${colors.border} text-sm text-white focus:border-blue-500 outline-none`} />
                    </div>
                    <div className="col-span-1">
                        <label className={`block text-[10px] uppercase font-bold ${colors.textMuted} mb-1`}>Type</label>
                        <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })} className={`w-full p-2 rounded-md ${colors.bgPanel} border ${colors.border} text-sm text-white focus:border-blue-500 outline-none`}>
                            <option value="faker">Faker</option>
                            <option value="llm">AI / LLM</option>
                            <option value="integer">Number (Int)</option>
                            <option value="boolean">Boolean</option>
                            <option value="regex">Regex Pattern</option>
                            <option value="timestamp">Timestamp</option>
                            <option value="distribution">Distro</option>
                            <option value="foreign_key">Relation (FK)</option>
                        </select>
                    </div>
                </div>

                <div className={`mb-4 p-3 rounded border border-dashed border-gray-700 bg-[#161b22]/50`}>

                    {newField.type === "faker" && (
                        <div>
                            <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Faker Method</label>
                            <select value={fakerMethod} onChange={e => setFakerMethod(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`}>
                                <option value="uuid4">UUID</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                                <option value="job">Job Title</option>
                                <option value="address">Address</option>
                                <option value="ean">EAN Code</option>
                                <option value="phone_number">Phone</option>
                            </select>
                        </div>
                    )}

                    {newField.type === "integer" && (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 p-2 rounded bg-indigo-900/20 border border-indigo-700/50 text-indigo-300 text-[10px] mb-2">
                                <Hash size={12} className="mt-0.5 shrink-0" />
                                <div><span className="font-bold">Number Range:</span> Generates random integers between Min and Max.</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Min Value</label>
                                    <input type="number" value={intMin} onChange={e => setIntMin(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} />
                                </div>
                                <div className="flex-1">
                                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Max Value</label>
                                    <input type="number" value={intMax} onChange={e => setIntMax(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} />
                                </div>
                            </div>
                        </div>
                    )}

                    {newField.type === "boolean" && (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 p-2 rounded bg-indigo-900/20 border border-indigo-700/50 text-indigo-300 text-[10px] mb-2">
                                <ToggleLeft size={12} className="mt-0.5 shrink-0" />
                                <div><span className="font-bold">Boolean Flag:</span> Generates True/False values.</div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className={`block text-xs font-bold ${colors.textMuted}`}>Probability of TRUE</label>
                                    <span className="text-xs font-mono text-blue-400">{boolProb}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={boolProb} onChange={(e) => setBoolProb(e.target.value)} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                        </div>
                    )}

                    {newField.type === "regex" && (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 p-2 rounded bg-pink-900/20 border border-pink-700/50 text-pink-300 text-[10px] mb-2">
                                <Hash size={12} className="mt-0.5 shrink-0" />
                                <div><span className="font-bold">Regex Pattern:</span> Uses `rstr` to generate matching strings. Example: <code className="bg-black/30 px-1 rounded">\d{2}-[A-Z]{3}</code></div>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Pattern</label>
                                <input type="text" value={regexPattern} onChange={e => setRegexPattern(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm font-mono`} placeholder="\d{3}-[A-Z]{2}" />
                            </div>
                        </div>
                    )}

                    {newField.type === "timestamp" && (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 p-2 rounded bg-cyan-900/20 border border-cyan-700/50 text-cyan-300 text-[10px] mb-2">
                                <Calendar size={12} className="mt-0.5 shrink-0" />
                                <div><span className="font-bold">Time Range:</span> Supports 'now', '-1y', '+30d', or 'YYYY-MM-DD'.</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Start Date</label>
                                    <input type="text" value={tsMin} onChange={e => setTsMin(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} placeholder="-1y" />
                                </div>
                                <div className="flex-1">
                                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>End Date</label>
                                    <input type="text" value={tsMax} onChange={e => setTsMax(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} placeholder="now" />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Output Format</label>
                                <input type="text" value={tsFormat} onChange={e => setTsFormat(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm font-mono`} placeholder="%Y-%m-%d %H:%M:%S" />
                                <p className="text-[9px] text-gray-500 mt-1">Use "iso" for ISO 8601, "timestamp" for unix epoch, or standard strftime format.</p>
                            </div>
                        </div>
                    )}

                    {newField.type === "llm" && (
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <label className={`block text-xs font-bold ${colors.textMuted}`}>Prompt Template</label>
                                </div>
                                <textarea ref={textAreaRef} value={llmPrompt} onChange={e => setLlmPrompt(e.target.value)} placeholder="e.g. Generate a creative name based on {gender}..." className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm h-24 font-mono text-xs focus:border-blue-500 outline-none`} />
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
                                    <label className={`flex items-center gap-1 text-xs font-bold ${colors.textMuted}`}><Thermometer size={12} /> Temperature (Creativity)</label>
                                    <span className="text-xs font-mono text-blue-400">{llmTemperature}</span>
                                </div>
                                <input type="range" min="0" max="2" step="0.1" value={llmTemperature} onChange={(e) => setLlmTemperature(e.target.value)} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                            {isDeterministicRisk && <div className="flex items-start gap-2 p-2 rounded bg-yellow-900/20 border border-yellow-700/50 text-yellow-500 text-[10px]"><AlertTriangle size={12} className="mt-0.5 shrink-0" /><div><span className="font-bold">Warning:</span> Low temperature without uniqueness may result in identical values.</div></div>}
                            <div>
                                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition mt-2"><Sliders size={10} /> {showAdvanced ? "Hide" : "Show"} Advanced Parameters</button>
                                {showAdvanced && (
                                    <div className="mt-3 space-y-3 p-3 bg-black/20 rounded border border-[#30363d]">
                                        <div><div className="flex justify-between items-center mb-1"><label className={`text-[10px] font-bold ${colors.textMuted}`}>Top P</label><span className="text-[10px] font-mono text-gray-400">{llmTopP}</span></div><input type="range" min="0" max="1" step="0.05" value={llmTopP} onChange={(e) => setLlmTopP(e.target.value)} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500" /></div>
                                        <div><div className="flex justify-between items-center mb-1"><label className={`text-[10px] font-bold ${colors.textMuted}`}>Freq. Penalty</label><span className="text-[10px] font-mono text-gray-400">{llmFreqPenalty}</span></div><input type="range" min="0" max="2" step="0.1" value={llmFreqPenalty} onChange={(e) => setLlmFreqPenalty(e.target.value)} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500" /></div>
                                        <div><div className="flex justify-between items-center mb-1"><label className={`text-[10px] font-bold ${colors.textMuted}`}>Pres. Penalty</label><span className="text-[10px] font-mono text-gray-400">{llmPresPenalty}</span></div><input type="range" min="0" max="2" step="0.1" value={llmPresPenalty} onChange={(e) => setLlmPresPenalty(e.target.value)} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500" /></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {newField.type === "distribution" && (
                        <div className="space-y-3">
                            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Options (comma sep)</label><input type="text" value={distOptions} onChange={e => setDistOptions(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} /></div>
                            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Weights (comma sep)</label><input type="text" value={distWeights} onChange={e => setDistWeights(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} /></div>
                        </div>
                    )}

                    {newField.type === "foreign_key" && (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 p-2 rounded bg-blue-900/20 border border-blue-700/50 text-blue-300 text-[10px] mb-2"><Link2 size={12} className="mt-0.5 shrink-0" /><div><span className="font-bold">Relation:</span> Select a source table. <div className="mt-1 text-gray-400 font-normal">Tip: When using this field in LLM prompts later, you can access parent columns like: <code className="bg-black/30 px-1 rounded text-orange-300">{`{${newField.name || 'field'}.column_name}`}</code></div></div></div>
                            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Source Table</label><select value={fkTargetTable} onChange={e => { setFkTargetTable(e.target.value); setFkTargetColumn(""); }} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`}><option value="">-- Select Table --</option>{tables.filter(t => t.id !== activeTableId).map(t => (<option key={t.id} value={t.id}>{t.name} ({t.rows_count} rows)</option>))}</select></div>
                            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Source Column</label><select value={fkTargetColumn} onChange={e => setFkTargetColumn(e.target.value)} disabled={!fkTargetTable} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm disabled:opacity-50`}><option value="">-- Select Column --</option>{targetTableObj && targetTableObj.fields.map(col => (<option key={col.name} value={col.name}>{col.name} ({col.type})</option>))}</select></div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#30363d]">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none"><input type="checkbox" checked={newField.is_unique} onChange={(e) => setNewField({ ...newField, is_unique: e.target.checked })} className="w-4 h-4 rounded border-gray-600 bg-[#0d1117] text-blue-600 focus:ring-offset-[#161b22]" /><span className="text-xs font-medium">Unique Value</span></label>
                    <div className="flex gap-2">
                        {fieldToEdit && (<button onClick={onCancelEdit} className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1"><XCircle size={14} /> Cancel</button>)}
                        <button onClick={handleSubmit} className={`text-white px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition shadow-md border border-[rgba(240,246,252,0.1)] ${fieldToEdit ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#238636] hover:bg-[#2ea043]'}`}>{fieldToEdit ? <Save size={16} /> : <Plus size={16} />}{fieldToEdit ? 'Update Field' : 'Add Field'}</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SchemaBuilder;