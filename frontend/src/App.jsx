import { useState } from 'react';
import axios from 'axios';
import { Database, Play, HelpCircle } from 'lucide-react';
import { colors } from './theme';

import GlobalConfig from './components/GlobalConfig';
import SchemaBuilder from './components/schema/SchemaBuilder';
import FieldList from './components/FieldList';
import OutputDisplay from './components/OutputDisplay';
import HelpModal from './components/HelpModal';
import TableManager from './components/TableManager';

function App() {
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const [config, setConfig] = useState({
    job_name: "E-commerce DB",
    global_context: "Online store with users and orders.",
    output_format: "json",
    locale: "en_US"
  });

  const [tables, setTables] = useState([
    {
      id: "t_users",
      name: "users",
      rows_count: 10,
      fields: []
    }
  ]);
  const [activeTableId, setActiveTableId] = useState("t_users");
  const [editingIndex, setEditingIndex] = useState(null);

  const activeTable = tables.find(t => t.id === activeTableId) || tables[0];
  const activeFields = activeTable.fields;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTable = () => {
    const newId = `t_${generateId()}`;
    const newTable = {
      id: newId,
      name: `table_${tables.length + 1}`,
      rows_count: 10,
      fields: [
        { name: "id", type: "faker", is_unique: true, dependencies: [], params: { method: "uuid4" } }
      ]
    };
    setTables([...tables, newTable]);
    setActiveTableId(newId);
  };

  const removeTable = (id) => {
    if (tables.length <= 1) return;
    const newTables = tables.filter(t => t.id !== id);
    setTables(newTables);
    if (activeTableId === id) setActiveTableId(newTables[0].id);
  };

  const updateTable = (id, updates) => {
    setTables(tables.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addField = (newField) => {
    const updatedTable = { ...activeTable, fields: [...activeTable.fields, newField] };
    updateTable(activeTableId, updatedTable);
  };

  const updateField = (updatedField) => {
    const newFields = [...activeTable.fields];
    newFields[editingIndex] = updatedField;
    updateTable(activeTableId, { fields: newFields });
    setEditingIndex(null);
  };

  const removeField = (index) => {
    const newFields = [...activeTable.fields];
    newFields.splice(index, 1);
    updateTable(activeTableId, { fields: newFields });
    if (editingIndex === index) setEditingIndex(null);
  };

  const startEditing = (index) => setEditingIndex(index);
  const cancelEditing = () => setEditingIndex(null);

  const handleExportConfig = () => {
    const projectData = {
      config: config,
      tables: tables,
      version: "2.0"
    };
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
          setError(null);
        } else {
          setError("Invalid v2 schema format. Missing 'tables'.");
        }
      } catch (err) {
        setError("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    setLoading(true);
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
      if (config.output_format === 'json') {
        const response = await axios.post('http://127.0.0.1:8000/generate', payload);
        setGeneratedData(response.data);
      } else {
        const response = await axios.post('http://127.0.0.1:8000/generate', payload, {
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
        setLoading(false);
      }
    } catch (err) {
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const jsonError = JSON.parse(text);
          setError(jsonError.detail || "Error generating file");
        } catch (e) {
          setError("Unknown error generating file");
        }
      } else {
        setError(err.message + (err.response ? ": " + JSON.stringify(err.response.data) : ""));
      }
    } finally {
      setLoading(false);
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

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

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
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
            title="Open Tutorial & Guide"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        <GlobalConfig
          config={config}
          setConfig={setConfig}
          onExport={handleExportConfig}
          onImport={handleImportConfig}
        />

        <TableManager
          tables={tables}
          activeTableId={activeTableId}
          onAddTable={addTable}
          onRemoveTable={removeTable}
          onSelectTable={setActiveTableId}
          onUpdateTable={updateTable}
        />

        <SchemaBuilder
          onAddField={addField}
          onUpdateField={updateField}
          onCancelEdit={cancelEditing}
          existingFields={activeFields}
          fieldToEdit={editingIndex !== null ? activeFields[editingIndex] : null}
          tables={tables}
          activeTableId={activeTableId}
        />

        <FieldList
          fields={activeFields}
          onRemoveField={removeField}
          onEditField={startEditing}
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