import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Play, HelpCircle } from 'lucide-react';
import { colors } from './theme';
import { useSchema } from './hooks/useSchema';
import Toast from './components/ui/Toast';
import GlobalConfig from './components/GlobalConfig';
import SchemaBuilder from './components/schema/SchemaBuilder';
import FieldList from './components/FieldList';
import OutputDisplay from './components/OutputDisplay';
import TableManager from './components/TableManager';
import HelpModal from './components/modals/HelpModal';
import TemplateModal from './components/modals/TemplateModal';
import ProjectModal from './components/modals/ProjectModal';
import SaveModal from './components/modals/SaveModal';
import GenerationModal from './components/modals/GenerationModal';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);

  const [modals, setModals] = useState({
    help: false,
    template: false,
    project: false,
    save: false,
    generation: false
  });

  const [config, setConfig] = useState({
    job_name: "E-commerce DB",
    global_context: "Online store with users and orders.",
    output_format: "json",
    locale: "en_US"
  });

  const {
    tables,
    setTables,
    activeTableId,
    setActiveTableId,
    activeFields,
    editingIndex,
    actions
  } = useSchema([
    {
      id: "t_users",
      name: "users",
      rows_count: 10,
      fields: []
    }
  ]);

  const toggleModal = (modalName, isOpen) => {
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
  };

  const showToast = (type, message) => {
    setNotification({ type, message });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLoadTemplate = (template) => {
    setConfig({ ...config, ...template.config });
    setTables(template.tables);
    if (template.tables.length > 0) setActiveTableId(template.tables[0].id);
    setGeneratedData(null);
    setError(null);
    toggleModal('template', false);
    showToast('success', `Template "${template.name}" loaded successfully.`);
  };

  const executeSaveToCloud = async (saveName) => {
    if (!saveName.trim()) { showToast('error', "Project name cannot be empty."); return; }
    const payload = { name: saveName, description: config.global_context, schema_data: { config: { ...config, job_name: saveName }, tables: tables } };
    try {
      await axios.post('http://localhost:8000/projects', payload);
      setConfig(prev => ({ ...prev, job_name: saveName }));
      toggleModal('save', false);
      showToast('success', "Project saved to database successfully!");
    } catch (e) {
      showToast('error', "Error saving: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleLoadFromCloud = async (projectId) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/projects/${projectId}`);
      const data = res.data;
      if (data.config && Array.isArray(data.tables)) {
        setConfig(data.config);
        setTables(data.tables);
        if (data.tables.length > 0) setActiveTableId(data.tables[0].id);
        setError(null);
        setGeneratedData(null);
        toggleModal('project', false);
        showToast('success', "Project loaded successfully!");
      } else { showToast('error', "Invalid project data format."); }
    } catch (e) {
      showToast('error', "Error loading: " + (e.response?.data?.detail || e.message));
    } finally { setLoading(false); }
  };

  const handleExportConfig = () => {
    const projectData = { config, tables, version: "2.0" };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.job_name.replace(/\s+/g, '_').toLowerCase()}_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.config && Array.isArray(importedData.tables)) {
          setConfig(importedData.config);
          setTables(importedData.tables);
          setActiveTableId(importedData.tables[0].id);
          showToast('success', "Imported successfully.");
        } else { showToast('error', "Invalid format."); }
      } catch (err) { showToast('error', "Parse error: " + err.message); }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    setError(null);
    setGeneratedData(null);

    const payload = {
      config: config,
      tables: tables.map(t => ({
        id: t.id,
        name: t.name,
        rows_count: t.rows_count,
        fields: t.fields
      }))
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/generate/async', payload);
      const jobId = response.data.job_id;

      setCurrentJobId(jobId);
      toggleModal('generation', true);

    } catch (err) {
      showToast('error', "Failed to start generation: " + err.message);
    }
  };

  const handleJobComplete = async (jobId) => {
    try {
      if (config.output_format === 'json') {
        const response = await axios.get(`http://127.0.0.1:8000/jobs/${jobId}/result`);
        setGeneratedData(response.data);
        toggleModal('generation', false);
        showToast('success', "Data generated!");
      } else {
        const response = await axios.get(`http://127.0.0.1:8000/jobs/${jobId}/result`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const ext = config.output_format === 'csv' ? 'zip' : 'sql';
        link.setAttribute('download', `${config.job_name}.${ext}`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        toggleModal('generation', false);
        showToast('success', "File downloaded!");
      }
    } catch (err) {
      showToast('error', "Failed to retrieve results.");
    }
  };

  const downloadFile = () => {
    if (!generatedData) return;
    const blob = new Blob([JSON.stringify(generatedData.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.job_name}.json`;
    a.click();
  };

  return (
    <div className={`min-h-screen ${colors.bgMain} ${colors.textMain} font-sans flex flex-col md:flex-row selection:bg-blue-500 selection:text-white relative`}>

      {notification && <Toast type={notification.type} message={notification.message} />}

      {modals.save && (
        <SaveModal
          onClose={() => toggleModal('save', false)}
          onSave={executeSaveToCloud}
          initialName={config.job_name}
        />
      )}
      {modals.help && <HelpModal onClose={() => toggleModal('help', false)} />}
      {modals.template && <TemplateModal onClose={() => toggleModal('template', false)} onSelect={handleLoadTemplate} />}
      {modals.project && <ProjectModal onClose={() => toggleModal('project', false)} onLoad={handleLoadFromCloud} />}

      {modals.generation && (
        <GenerationModal
          jobId={currentJobId}
          onClose={() => toggleModal('generation', false)}
          onComplete={handleJobComplete}
        />
      )}

      <div className={`w-full md:w-5/12 lg:w-4/12 ${colors.bgPanel} border-r ${colors.border} p-6 overflow-y-auto h-screen z-10 flex flex-col`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-md">
              <Database size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">DataSynth<span className="text-blue-400">.ai</span></h1>
              <p className={`text-xs ${colors.textMuted}`}>Relational Data Generator</p>
            </div>
          </div>
          <button onClick={() => toggleModal('help', true)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <HelpCircle size={20} />
          </button>
        </div>

        <GlobalConfig
          config={config}
          setConfig={setConfig}
          onExport={handleExportConfig}
          onImport={handleImportConfig}
          onOpenTemplates={() => toggleModal('template', true)}
          onSaveCloud={() => toggleModal('save', true)}
          onOpenProjects={() => toggleModal('project', true)}
        />

        <TableManager
          tables={tables}
          activeTableId={activeTableId}
          onAddTable={actions.addTable}
          onRemoveTable={actions.removeTable}
          onSelectTable={setActiveTableId}
          onUpdateTable={actions.updateTable}
        />

        <SchemaBuilder
          onAddField={actions.addField}
          onUpdateField={actions.updateField}
          onCancelEdit={actions.cancelEditing}
          existingFields={activeFields}
          fieldToEdit={editingIndex !== null ? activeFields[editingIndex] : null}
          tables={tables}
          activeTableId={activeTableId}
        />

        <FieldList
          fields={activeFields}
          onRemoveField={actions.removeField}
          onEditField={actions.startEditing}
          editingIndex={editingIndex}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || tables.length === 0}
          className={`w-full py-2.5 rounded-md font-bold text-white shadow-lg flex justify-center items-center gap-2 transition-all border border-[rgba(240,246,252,0.1)] ${loading || tables.length === 0
            ? 'bg-[#21262d] text-gray-500 cursor-not-allowed border-none'
            : 'bg-[#1f6feb] hover:bg-[#388bfd]'
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-sm"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</span>
          ) : (
            <span className="flex items-center gap-2 text-sm"><Play size={16} fill="currentColor" /> Run Generation</span>
          )}
        </button>
      </div>

      <OutputDisplay
        loading={loading}
        error={error}
        generatedData={generatedData}
        config={config}
        onDownload={downloadFile}
        setError={setError}
      />
    </div>
  );
}

export default App;