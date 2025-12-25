import { X, BookOpen, Wand2, Thermometer, Layers, Zap, Brain, Sliders } from 'lucide-react';
import { colors } from '../theme';

function HelpModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto ${colors.bgPanel} border ${colors.border} rounded-xl shadow-2xl flex flex-col`}>

                <div className="flex items-center justify-between p-6 border-b border-[#30363d] sticky top-0 bg-[#161b22] z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="text-blue-400" /> Generator Guide & Tutorials
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-10 text-sm text-gray-300 leading-relaxed">

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-yellow-400" /> 1. The Golden Rule: Faker vs. AI
                        </h3>
                        <p className="mb-4 text-gray-400">
                            Don't use a cannon to kill a fly. Choosing the right tool saves time and tokens.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-green-800/50 bg-green-900/10 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3 text-green-400 font-bold uppercase tracking-wider text-xs">
                                    <Layers size={14} /> Use Faker For (Standard Data)
                                </div>
                                <ul className="space-y-2 text-xs text-gray-300">
                                    <li className="flex items-start gap-2"><span className="text-green-500">✓</span> <strong>Identity:</strong> UUID, Names, Usernames, Emails</li>
                                    <li className="flex items-start gap-2"><span className="text-green-500">✓</span> <strong>Geo:</strong> Addresses, Cities, Countries, Zip Codes</li>
                                    <li className="flex items-start gap-2"><span className="text-green-500">✓</span> <strong>Internet:</strong> IPv4, MAC, URLs, File Names</li>
                                    <li className="flex items-start gap-2"><span className="text-green-500">✓</span> <strong>Tech:</strong> Dates, Boolean flags, Numbers</li>
                                </ul>
                                <div className="mt-3 pt-3 border-t border-green-800/30 text-[10px] text-green-300/70 italic">
                                    Result: Instant generation, 100% deterministic formats.
                                </div>
                            </div>

                            <div className="border border-purple-800/50 bg-purple-900/10 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3 text-purple-400 font-bold uppercase tracking-wider text-xs">
                                    <Brain size={14} /> Use AI (LLM) For (Creative / Context)
                                </div>
                                <ul className="space-y-2 text-xs text-gray-300">
                                    <li className="flex items-start gap-2"><span className="text-purple-500">✓</span> <strong>Creative:</strong> Reviews, Bios, Slogans, Descriptions</li>
                                    <li className="flex items-start gap-2"><span className="text-purple-500">✓</span> <strong>Contextual:</strong> "Review for {`{product_name}`}"</li>
                                    <li className="flex items-start gap-2"><span className="text-purple-500">✓</span> <strong>Complex Logic:</strong> "If age {'>'} 18 return 'Adult'"</li>
                                    <li className="flex items-start gap-2"><span className="text-purple-500">✓</span> <strong>Unstructured:</strong> Realistic chat logs, JSON blobs</li>
                                </ul>
                                <div className="mt-3 pt-3 border-t border-purple-800/30 text-[10px] text-purple-300/70 italic">
                                    Result: High variance, slower, costs tokens.
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-[#30363d]" />

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Wand2 size={18} className="text-blue-400" /> 2. Prompt Engineering (Context Injection)
                        </h3>

                        <div className="flex flex-col gap-4">
                            <div>

                                <p className="mb-2 text-xs text-gray-400">
                                    To make data relational, inject values from previous columns using curly braces <code className="bg-gray-700 px-1 rounded text-orange-300">{`{field_name}`}</code>.
                                </p>
                                <div className="p-3 bg-black/40 rounded border border-[#30363d] font-mono text-xs">
                                    <span className="text-gray-500">Prompt:</span> "Write a short, angry review for a product named <span className="text-orange-400">{`{item_name}`}</span> costing <span className="text-orange-400">{`{price}`}</span>."
                                </div>
                            </div>

                            <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded">
                                <p className="font-bold text-blue-300 text-xs mb-1">Tip: Handling Relations (Foreign Keys)</p>
                                <p className="text-[11px] text-gray-400">
                                    If you have a Foreign Key field (e.g., <code className="text-blue-200">user_id</code>), you can access the parent table's data using dot notation: <code className="bg-black/30 px-1 rounded text-orange-300">{`{user_id.name}`}</code> or <code className="bg-black/30 px-1 rounded text-orange-300">{`{user_id.email}`}</code>.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-[#30363d]" />

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Sliders size={18} className="text-orange-400" /> 3. Advanced AI Control
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-200 text-sm mb-1 flex items-center gap-2">
                                    <Thermometer size={14} /> Temperature (Randomness)
                                </h4>

                                <p className="text-xs text-gray-400 mb-2">Controls how "risky" the model is.</p>
                                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                    <div className="bg-[#0d1117] p-2 rounded border border-gray-700">
                                        <div className="text-blue-400 font-bold">0.0 - 0.3</div>
                                        <div>Precise / Deterministic</div>
                                    </div>
                                    <div className="bg-[#0d1117] p-2 rounded border border-gray-700">
                                        <div className="text-green-400 font-bold">0.7 - 1.0</div>
                                        <div>Balanced / Creative</div>
                                    </div>
                                    <div className="bg-[#0d1117] p-2 rounded border border-gray-700">
                                        <div className="text-red-400 font-bold">1.2+</div>
                                        <div>Chaotic / Random</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-gray-200 text-sm mb-1">Top P (Nucleus Sampling)</h4>
                                    <p className="text-xs text-gray-400 mb-2">
                                        Limits the pool of vocabulary tokens.
                                    </p>
                                    <ul className="text-[11px] space-y-1 text-gray-500">
                                        <li><strong>1.0 (Default):</strong> Considers all possible words.</li>
                                        <li><strong>0.1:</strong> Only considers the top 10% most likely words.</li>
                                        <li><span className="text-orange-300">Use case:</span> Lower this if the AI is generating nonsense words or hallucinating too much.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-200 text-sm mb-1">Penalties (Repetition Control)</h4>
                                    <p className="text-xs text-gray-400 mb-2">
                                        Forces the model to avoid repeating itself.
                                    </p>
                                    <ul className="text-[11px] space-y-2 text-gray-500">
                                        <li>
                                            <strong>Frequency Penalty:</strong> Penalizes words based on how many times they appeared.
                                            <em className="block text-gray-600">Prevents: "Hello hello hello world."</em>
                                        </li>
                                        <li>
                                            <strong>Presence Penalty:</strong> Penalizes words if they appeared at all.
                                            <em className="block text-gray-600">Encourages: Switching topics completely.</em>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                <div className="p-6 border-t border-[#30363d] bg-[#161b22] flex justify-end sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-md font-medium border border-[#30363d] transition"
                    >
                        Close Guide
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HelpModal;