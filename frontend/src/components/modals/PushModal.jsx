import { useState } from 'react';
import api from '../../lib/api';
import { Database, X, Check, AlertTriangle, UploadCloud, Loader2 } from 'lucide-react';
import { colors } from '../../theme';

function PushModal({ onClose, jobId }) {
    const [connString, setConnString] = useState("postgresql://client:clientpass@target-db:5432/clientdb");
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState(null);

    const handleTest = async () => {
        setStatus("testing");
        setMessage(null);
        try {
            await api.post('/connectors/test', { connection_string: connString });
            setStatus("idle");
            alert("Connection successful!");
        } catch (err) {
            setStatus("error");
            setMessage("Connection failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handlePush = async () => {
        setStatus("pushing");
        setMessage(null);
        try {
            await api.post('/connectors/push', {
                job_id: jobId,
                connection_string: connString
            });
            setStatus("success");
            setMessage("Data successfully inserted into the database!");
        } catch (err) {
            setStatus("error");
            setMessage("Push failed: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-lg bg-[#0d1117] border ${colors.border} rounded-xl shadow-2xl flex flex-col`}>

                <div className="flex items-center justify-between p-6 border-b border-[#30363d] bg-[#161b22] rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <UploadCloud className="text-blue-400" /> Push to Database
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {status === "success" ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in">
                            <div className="w-16 h-16 bg-green-900/20 text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-900/50">
                                <Check size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
                            <p className="text-gray-400 mb-6">{message}</p>
                            <button onClick={onClose} className="bg-[#21262d] border border-[#30363d] text-white px-6 py-2 rounded-md hover:bg-[#30363d] transition">Close</button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Database Connection String (URI)</label>
                                <div className="relative">
                                    <Database size={16} className="absolute left-3 top-3 text-gray-500" />
                                    <input
                                        type="text"
                                        value={connString}
                                        onChange={(e) => setConnString(e.target.value)}
                                        className={`w-full pl-9 p-2.5 rounded-md bg-[#010409] border ${colors.border} text-sm text-white focus:border-blue-500 outline-none font-mono`}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">
                                    Supported: PostgreSQL, MySQL, SQLite, Oracle, MSSQL. <br />
                                    Example: <code>postgresql://user:pass@host:5432/db</code>
                                </p>
                            </div>

                            {message && status === "error" && (
                                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded flex items-start gap-2 text-red-300 text-xs">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    {message}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleTest}
                                    disabled={status === "pushing"}
                                    className="flex-1 py-2.5 rounded-md border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-sm font-medium transition"
                                >
                                    Test Connection
                                </button>
                                <button
                                    onClick={handlePush}
                                    disabled={status === "pushing"}
                                    className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    {status === "pushing" ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                    {status === "pushing" ? "Pushing Data..." : "Push Data"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PushModal;