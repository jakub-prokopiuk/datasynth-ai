import { Table, Plus, Trash2, Layers, Hash } from 'lucide-react';
import { colors } from '../theme';

function TableManager({ tables, activeTableId, onAddTable, onRemoveTable, onSelectTable, onUpdateTable }) {

    return (
        <section className="mb-8 space-y-4 border-b border-[#30363d] pb-6">
            <div className="flex items-center justify-between">
                <h2 className={`text-xs font-bold ${colors.textMuted} uppercase tracking-wider flex items-center gap-2`}>
                    <Layers size={14} /> Database Tables ({tables.length})
                </h2>
                <button
                    onClick={onAddTable}
                    className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1 transition shadow-lg shadow-blue-900/20"
                >
                    <Plus size={12} /> Add Table
                </button>
            </div>

            <div className="space-y-2">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        onClick={() => onSelectTable(table.id)}
                        className={`group p-3 rounded-md border transition-all cursor-pointer flex flex-col gap-3 relative
                            ${table.id === activeTableId
                                ? 'bg-[#1f242c] border-blue-500/50 shadow-md'
                                : 'bg-[#0d1117] border-[#30363d] hover:border-gray-600'
                            }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <Table size={14} className={table.id === activeTableId ? "text-blue-400" : "text-gray-500"} />
                                <input
                                    type="text"
                                    value={table.name}
                                    onChange={(e) => onUpdateTable(table.id, { name: e.target.value })}
                                    className={`bg-transparent border-none outline-none text-sm font-semibold w-full
                                        ${table.id === activeTableId ? 'text-white' : 'text-gray-400'}`}
                                    placeholder="Table Name"
                                />
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveTable(table.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition"
                                title="Remove Table"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-[#010409] p-1.5 rounded border border-[#30363d]">
                            <div className="flex items-center gap-1.5 px-1.5 border-r border-[#30363d]">
                                <Hash size={12} className="text-gray-500" />
                                <span className="text-[10px] text-gray-500 font-medium uppercase">Rows</span>
                            </div>

                            <input
                                type="number"
                                min="0"
                                value={table.rows_count === 0 ? "" : table.rows_count}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    onUpdateTable(table.id, { rows_count: isNaN(val) ? 0 : val });
                                }}
                                className={`bg-transparent border-none outline-none text-xs font-mono w-full px-1 text-gray-300 placeholder-gray-700
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                placeholder="0"
                            />
                        </div>
                        {table.id === activeTableId && (
                            <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-blue-500 rounded-r-full"></div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default TableManager;