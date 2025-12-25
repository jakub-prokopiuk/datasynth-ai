import { useRef } from 'react';
import { Settings, Upload, Save, Globe, FileJson, FileSpreadsheet, Database } from 'lucide-react';
import { colors } from '../theme';
import CustomSelect from './ui/CustomSelect';
import { FlagIcon } from 'react-flag-kit';

const LOCALE_OPTIONS = [
    {
        value: "en_US",
        label: <div className="flex items-center gap-2"><FlagIcon code="US" size={16} /> English (US)</div>
    },
    {
        value: "pl_PL",
        label: <div className="flex items-center gap-2"><FlagIcon code="PL" size={16} /> Polish (Poland)</div>
    },
    {
        value: "de_DE",
        label: <div className="flex items-center gap-2"><FlagIcon code="DE" size={16} /> German (Germany)</div>
    },
    {
        value: "fr_FR",
        label: <div className="flex items-center gap-2"><FlagIcon code="FR" size={16} /> French (France)</div>
    },
    {
        value: "es_ES",
        label: <div className="flex items-center gap-2"><FlagIcon code="ES" size={16} /> Spanish (Spain)</div>
    },
    {
        value: "it_IT",
        label: <div className="flex items-center gap-2"><FlagIcon code="IT" size={16} /> Italian (Italy)</div>
    },
    {
        value: "ja_JP",
        label: <div className="flex items-center gap-2"><FlagIcon code="JP" size={16} /> Japanese (Japan)</div>
    },
];

const FORMAT_OPTIONS = [
    { value: "json", label: "JSON", icon: FileJson },
    { value: "csv", label: "CSV (Zip)", icon: FileSpreadsheet },
    { value: "sql", label: "SQL", icon: Database },
];

function GlobalConfig({ config, setConfig, onExport, onImport }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        onImport(file);
        e.target.value = null;
    };

    return (
        <section className="mb-8 space-y-4 border-b border-[#30363d] pb-6">
            <div className="flex items-center justify-between">
                <h2 className={`text-xs font-bold ${colors.textMuted} uppercase tracking-wider flex items-center gap-2`}>
                    <Settings size={14} /> Global Configuration
                </h2>

                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    <button onClick={() => fileInputRef.current.click()} className="text-[10px] bg-[#21262d] hover:bg-[#30363d] text-gray-300 px-2 py-1 rounded border border-[#30363d] flex items-center gap-1 transition">
                        <Upload size={12} /> Import
                    </button>
                    <button onClick={onExport} className="text-[10px] bg-[#21262d] hover:bg-[#30363d] text-gray-300 px-2 py-1 rounded border border-[#30363d] flex items-center gap-1 transition">
                        <Save size={12} /> Save
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className={`block text-xs font-semibold ${colors.textMain} mb-1.5`}>Dataset Name</label>
                    <input
                        type="text"
                        value={config.job_name}
                        onChange={(e) => setConfig({ ...config, job_name: e.target.value })}
                        className={`w-full p-2.5 rounded-md ${colors.inputBg} border ${colors.border} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm text-white`}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className={`block text-xs font-semibold ${colors.textMain} mb-1.5 flex items-center gap-1.5`}>
                            <Globe size={12} className="text-gray-400" /> Region / Locale
                        </label>
                        <CustomSelect
                            value={config.locale || "en_US"}
                            onChange={val => setConfig({ ...config, locale: val })}
                            options={LOCALE_OPTIONS}
                        />
                    </div>

                    <div className="flex-1">
                        <label className={`block text-xs font-semibold ${colors.textMain} mb-1.5`}>Output Format</label>
                        <CustomSelect
                            value={config.output_format}
                            onChange={val => setConfig({ ...config, output_format: val })}
                            options={FORMAT_OPTIONS}
                        />
                    </div>
                </div>

                <div>
                    <label className={`block text-xs font-semibold ${colors.textMain} mb-1.5`}>Global Context (AI)</label>
                    <textarea
                        rows="2"
                        value={config.global_context}
                        onChange={(e) => setConfig({ ...config, global_context: e.target.value })}
                        className={`w-full p-2.5 rounded-md ${colors.inputBg} border ${colors.border} focus:border-blue-500 outline-none text-sm text-white resize-none`}
                        placeholder="e.g. Healthcare system..."
                    />
                </div>
            </div>
        </section>
    );
}

export default GlobalConfig;