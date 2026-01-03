import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { X, Cloud, Trash2, Calendar, Loader2, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { colors } from '../../theme';

function ProjectModal({ onClose, onLoad }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [notification, setNotification] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects');
            setProjects(res.data);
            setError(null);
        } catch (e) {
            setError("Unable to fetch projects from the server.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        if (deleteConfirmId === id) {
            performDelete(id);
        } else {
            setDeleteConfirmId(id);
            setTimeout(() => setDeleteConfirmId(null), 3000);
        }
    };

    const performDelete = async (id) => {
        try {
            await api.delete(`/projects/${id}`);
            showNotification('success', 'Project deleted successfully');
            setDeleteConfirmId(null);
            fetchProjects();
        } catch (err) {
            showNotification('error', "Error deleting project: " + (err.response?.data?.detail || err.message));
            setDeleteConfirmId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-2xl bg-[#0d1117] border ${colors.border} rounded-xl shadow-2xl flex flex-col max-h-[85vh]`}>

                <div className="flex-none flex items-center justify-between p-6 border-b border-[#30363d] bg-[#161b22] rounded-t-xl z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Cloud className="text-blue-400" /> Saved Projects
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Manage projects saved in the database.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {notification && (
                    <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-lg border flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2 fade-in
                        ${notification.type === 'success'
                            ? 'bg-green-900/90 border-green-700 text-green-100'
                            : 'bg-red-900/90 border-red-700 text-red-100'}`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                        {notification.message}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
                            <Loader2 className="animate-spin" size={32} />
                            <span>Loading projects...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center p-4 border border-red-900/50 bg-red-900/10 rounded-lg flex flex-col items-center gap-2">
                            <AlertCircle size={24} />
                            {error}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 border-2 border-dashed border-[#30363d] rounded-lg">
                            No saved projects found. <br />Save your first project using the "Cloud Save" button.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {projects.map((proj) => (
                                <div
                                    key={proj.id}
                                    onClick={() => onLoad(proj.id)}
                                    className="group flex items-center justify-between p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-blue-500/50 hover:bg-[#1c2128] transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                            {proj.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(proj.updated_at).toLocaleDateString()}
                                            </span>
                                            {proj.description && (
                                                <span className="truncate max-w-[200px] opacity-70" title={proj.description}>
                                                    {proj.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteClick(e, proj.id)}
                                        className={`p-2 rounded-md transition-all flex items-center gap-1 z-20 
                                            ${deleteConfirmId === proj.id
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 px-3'
                                                : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100'
                                            }`}
                                        title={deleteConfirmId === proj.id ? "Click again to confirm" : "Delete project"}
                                    >
                                        <Trash2 size={16} />
                                        {deleteConfirmId === proj.id && (
                                            <span className="text-xs font-bold animate-in fade-in">Confirm?</span>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-none p-3 border-t border-[#30363d] bg-[#161b22] rounded-b-xl text-center">
                    <span className="text-xs text-gray-500">
                        Total projects: {projects.length}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProjectModal;