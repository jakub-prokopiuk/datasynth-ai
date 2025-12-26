import { useState } from 'react';
import { Download, Copy, Check, FileJson, AlertCircle, Eye, Info } from 'lucide-react';
import { colors } from '../theme';

const ROW_LIMIT = 100;

function OutputDisplay({ loading, error, generatedData, config, onDownload }) {
    const [copied, setCopied] = useState(false);

    const getPreviewData = (data) => {
        if (!data) return null;

        const preview = {};
        let wasTruncated = false;

        Object.keys(data).forEach(tableName => {
            const rows = data[tableName];
            if (Array.isArray(rows) && rows.length > ROW_LIMIT) {
                preview[tableName] = rows.slice(0, ROW_LIMIT);
                wasTruncated = true;
            } else {
                preview[tableName] = rows;
            }
        });

        return { preview, wasTruncated };
    };

    const handleCopy = () => {
        if (!generatedData) return;
        const { preview } = getPreviewData(generatedData);
        navigator.clipboard.writeText(JSON.stringify(preview, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className={`w-full md:w-7/12 lg:w-8/12 bg-[#0d1117] p-6 flex flex-col items-center justify-center text-center border-l ${colors.border}`}>
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Generating Dataset...</h3>
                <p className="text-gray-400 max-w-md">
                    Running complex Faker algorithms and resolving dependencies. <br />
                    Large datasets ({'>'}1000 rows) are processed asynchronously.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`w-full md:w-7/12 lg:w-8/12 bg-[#0d1117] p-6 flex flex-col items-center justify-center text-center border-l ${colors.border}`}>
                <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
                <p className="text-red-400 max-w-md break-words font-mono text-sm bg-red-950/30 p-4 rounded border border-red-900/50">
                    {error}
                </p>
            </div>
        );
    }

    if (!generatedData) {
        return (
            <div className={`w-full md:w-7/12 lg:w-8/12 bg-[#0d1117] p-6 flex flex-col items-center justify-center text-center border-l ${colors.border}`}>
                <div className="w-16 h-16 bg-[#21262d] text-gray-500 rounded-full flex items-center justify-center mb-6">
                    <FileJson size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ready to Generate</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                    Configure your schema on the left and click "Run Generation" to create your synthetic dataset.
                </p>
            </div>
        );
    }

    const { preview, wasTruncated } = getPreviewData(generatedData.data || generatedData);

    const jsonString = JSON.stringify(preview, null, 2);
    const totalRows = generatedData.total_rows || "Unknown";

    return (
        <div className={`w-full md:w-7/12 lg:w-8/12 bg-[#0d1117] flex flex-col h-screen border-l ${colors.border}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/20 text-green-400 rounded border border-green-900/50">
                        <Check size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Generation Successful</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{totalRows} rows total</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span className="uppercase">{config.output_format}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#30363d] rounded transition"
                        title="Copy Preview to Clipboard"
                    >
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white px-4 py-2 rounded text-sm font-bold transition shadow-lg shadow-blue-900/20"
                    >
                        <Download size={16} /> Download Full File
                    </button>
                </div>
            </div>

            {wasTruncated && (
                <div className="bg-blue-900/20 border-b border-blue-900/50 px-6 py-3 flex items-center gap-3">
                    <Info size={18} className="text-blue-400 flex-none" />
                    <p className="text-xs text-blue-200">
                        <span className="font-bold">Preview Truncated:</span> Showing only the first {ROW_LIMIT} rows per table for performance.
                        The downloaded file will contain the full dataset.
                    </p>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 relative group">
                <div className="absolute top-4 right-4 bg-[#0d1117]/80 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-500 border border-[#30363d] pointer-events-none">
                    PREVIEW MODE
                </div>

                <pre className="font-mono text-xs leading-relaxed text-gray-300">
                    <code className="language-json">
                        {jsonString}
                    </code>
                </pre>

                {wasTruncated && (
                    <div className="mt-4 text-center text-gray-500 text-xs italic border-t border-[#30363d] pt-4">
                        ... remaining data hidden in preview ...
                    </div>
                )}
            </div>
        </div>
    );
}

export default OutputDisplay;