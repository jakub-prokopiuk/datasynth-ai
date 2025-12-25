import { Hash, ToggleLeft, FileCode, Calendar, Link2 } from 'lucide-react';
import { colors } from '../../../theme';

export function FakerParams({ params, onChange }) {
    return (
        <div>
            <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Faker Method</label>
            <select
                value={params.method || "uuid4"}
                onChange={e => onChange({ method: e.target.value })}
                className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`}
            >
                <option value="uuid4">UUID</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="job">Job Title</option>
                <option value="address">Address</option>
                <option value="ean">EAN Code</option>
                <option value="phone_number">Phone</option>
            </select>
        </div>
    );
}

export function IntegerParams({ params, onChange }) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 rounded bg-indigo-900/20 border border-indigo-700/50 text-indigo-300 text-[10px] mb-2">
                <Hash size={12} className="mt-0.5 shrink-0" />
                <div><span className="font-bold">Number Range:</span> Generates random integers between Min and Max.</div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Min Value</label>
                    <input type="number" value={params.min ?? 0} onChange={e => onChange({ min: parseInt(e.target.value) })} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} />
                </div>
                <div className="flex-1">
                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Max Value</label>
                    <input type="number" value={params.max ?? 100} onChange={e => onChange({ max: parseInt(e.target.value) })} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} />
                </div>
            </div>
        </div>
    );
}

export function BooleanParams({ params, onChange }) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 rounded bg-indigo-900/20 border border-indigo-700/50 text-indigo-300 text-[10px] mb-2">
                <ToggleLeft size={12} className="mt-0.5 shrink-0" />
                <div><span className="font-bold">Boolean Flag:</span> Generates True/False values.</div>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className={`block text-xs font-bold ${colors.textMuted}`}>Probability of TRUE</label>
                    <span className="text-xs font-mono text-blue-400">{params.probability ?? 50}%</span>
                </div>
                <input type="range" min="0" max="100" value={params.probability ?? 50} onChange={(e) => onChange({ probability: parseInt(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
        </div>
    );
}

export function RegexParams({ params, onChange }) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 rounded bg-pink-900/20 border border-pink-700/50 text-pink-300 text-[10px] mb-2">
                <FileCode size={12} className="mt-0.5 shrink-0" />
                <div><span className="font-bold">Regex Pattern:</span> Uses `rstr` to generate matching strings. Example: <code className="bg-black/30 px-1 rounded">\d{2}-[A-Z]{3}</code></div>
            </div>
            <div>
                <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Pattern</label>
                <input type="text" value={params.pattern || "\\d{2}-\\d{3}"} onChange={e => onChange({ pattern: e.target.value })} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm font-mono`} />
            </div>
        </div>
    );
}

export function TimestampParams({ params, onChange }) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 rounded bg-cyan-900/20 border border-cyan-700/50 text-cyan-300 text-[10px] mb-2">
                <Calendar size={12} className="mt-0.5 shrink-0" />
                <div><span className="font-bold">Time Range:</span> Supports 'now', '-1y', '+30d', or 'YYYY-MM-DD'.</div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Start Date</label>
                    <input type="text" value={params.min_date || "-1y"} onChange={e => onChange({ min_date: e.target.value })} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} />
                </div>
                <div className="flex-1">
                    <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>End Date</label>
                    <input type="text" value={params.max_date || "now"} onChange={e => onChange({ max_date: e.target.value })} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} />
                </div>
            </div>
            <div>
                <label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Output Format</label>
                <input type="text" value={params.format || "%Y-%m-%d %H:%M:%S"} onChange={e => onChange({ format: e.target.value })} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm font-mono`} />
            </div>
        </div>
    );
}

export function DistributionParams({ params, onChange }) {
    const optionsStr = params.options ? params.options.join(", ") : "BUG, FEATURE, DOCS";
    const weightsStr = params.weights ? params.weights.join(", ") : "50, 30, 20";

    const handleOptions = (val) => onChange({ options: val.split(",").map(s => s.trim()) });
    const handleWeights = (val) => onChange({ weights: val.split(",").map(s => parseFloat(s.trim())) });

    return (
        <div className="space-y-3">
            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Options (comma sep)</label><input type="text" value={optionsStr} onChange={e => handleOptions(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} /></div>
            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Weights (comma sep)</label><input type="text" value={weightsStr} onChange={e => handleWeights(e.target.value)} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`} /></div>
        </div>
    );
}

export function ForeignKeyParams({ params, onChange, context }) {
    const { tables, activeTableId } = context;
    const targetTableObj = tables.find(t => t.id === params.table_id);
    const targetColumns = targetTableObj ? targetTableObj.fields : [];

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 rounded bg-blue-900/20 border border-blue-700/50 text-blue-300 text-[10px] mb-2"><Link2 size={12} className="mt-0.5 shrink-0" /><div><span className="font-bold">Relation:</span> Select a source table.</div></div>
            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Source Table</label><select value={params.table_id || ""} onChange={e => onChange({ table_id: e.target.value, column_name: "" })} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm`}><option value="">-- Select Table --</option>{tables.filter(t => t.id !== activeTableId).map(t => (<option key={t.id} value={t.id}>{t.name} ({t.rows_count} rows)</option>))}</select></div>
            <div><label className={`block text-xs font-bold ${colors.textMuted} mb-1`}>Source Column</label><select value={params.column_name || ""} onChange={e => onChange({ column_name: e.target.value })} disabled={!params.table_id} className={`w-full p-2 rounded border ${colors.border} bg-[#0d1117] text-white text-sm disabled:opacity-50`}><option value="">-- Select Column --</option>{targetColumns.map(col => (<option key={col.name} value={col.name}>{col.name} ({col.type})</option>))}</select></div>
        </div>
    );
}