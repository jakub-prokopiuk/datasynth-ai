import { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, Link2 } from 'lucide-react';
import { colors } from '../../../theme';

function TemplateParams({ params, onChange, context }) {
    const [templatePreset, setTemplatePreset] = useState("custom");
    const [templateSourceField, setTemplateSourceField] = useState("");
    const [templateDomain, setTemplateDomain] = useState("example.com");
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

    useEffect(() => {
        if (templatePreset !== 'custom' && templateSourceField) {
            if (templatePreset === 'email') {
                onChange({ template: `{{ ${templateSourceField} | slugify }}@${templateDomain}` });
            } else if (templatePreset === 'username') {
                onChange({ template: `{{ ${templateSourceField} | slugify('.') }}` });
            }
        }
    }, [templatePreset, templateSourceField, templateDomain]);

    const insertVariable = (variable) => {
        const toInsert = `{{ ${variable} }}`;
        if (textAreaRef.current) {
            const startPos = textAreaRef.current.selectionStart;
            const endPos = textAreaRef.current.selectionEnd;
            const text = params.template || "";
            const newText = text.substring(0, startPos) + toInsert + text.substring(endPos);
            onChange({ template: newText });
            setTimeout(() => {
                textAreaRef.current.focus();
                textAreaRef.current.setSelectionRange(startPos + toInsert.length, startPos + toInsert.length);
            }, 0);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 rounded bg-green-900/20 border border-green-700/50 text-green-300 text-[10px] mb-2">
                <LayoutTemplate size={12} className="mt-0.5 shrink-0" />
                <div><span className="font-bold">Derived Data:</span> Generate values based on other fields.</div>
            </div>

            <div className="bg-[#0d1117] p-2 rounded border border-[#30363d] mb-2">
                <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Generator Type</label>
                <select
                    value={templatePreset}
                    onChange={e => setTemplatePreset(e.target.value)}
                    className={`w-full p-2 rounded border ${colors.border} bg-[#161b22] text-white text-sm`}
                >
                    <option value="custom">Custom (Write Code)</option>
                    <option value="email">📧 Email from Name</option>
                    <option value="username">👤 Username from Name</option>
                </select>

                {templatePreset !== 'custom' && (
                    <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                        <label className="text-[10px] text-gray-500 font-bold block mb-1">Source Field</label>
                        <select
                            value={templateSourceField}
                            onChange={e => setTemplateSourceField(e.target.value)}
                            className={`w-full p-1.5 rounded border ${colors.border} bg-[#0d1117] text-white text-xs`}
                        >
                            <option value="">-- Select --</option>
                            {availableVars.filter(v => v.type === 'local').map(v => (
                                <option key={v.name} value={v.name}>{v.name}</option>
                            ))}
                        </select>
                        {templatePreset === 'email' && (
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold block mb-1">Domain</label>
                                <input type="text" value={templateDomain} onChange={e => setTemplateDomain(e.target.value)} className={`w-full p-1.5 rounded border ${colors.border} bg-[#0d1117] text-white text-xs`} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Logic Code (Jinja2)</label>
                <textarea
                    ref={textAreaRef}
                    value={params.template || ""}
                    onChange={e => {
                        onChange({ template: e.target.value });
                        setTemplatePreset('custom');
                    }}
                    className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-gray-300 text-sm h-16 font-mono text-xs focus:border-blue-500 outline-none ${templatePreset !== 'custom' ? 'opacity-50' : ''}`}
                    placeholder="{{ name }}@domain.com"
                />

                {templatePreset === 'custom' && availableVars.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {availableVars.map((v, i) => (
                            <button key={i} onClick={() => insertVariable(v.name)} className={`text-[10px] px-2 py-0.5 rounded border transition flex items-center gap-1.5 ${v.type === 'remote' ? 'bg-purple-900/20 border-purple-800 text-purple-300 hover:bg-purple-900/40' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`} title={`Insert {{ ${v.name} }}`}>
                                <span className="font-mono">{`{{ ${v.name} }}`}</span>
                                {v.type === 'remote' && <Link2 size={8} className="opacity-50" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TemplateParams;