import { useState, useEffect } from 'react';
import { Search, Filter, DownloadCloud, Loader2, CheckCircle, AlertTriangle, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE } from '../config';

export default function Reports() {
    const { token, fetchWithAuth } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) return;
            try {
                const res = await fetchWithAuth(`${API_BASE}/v1/history?limit=100`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setReports(data);
                } else {
                    setReports([]);
                }
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                setReports([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token, fetchWithAuth]);
    const handleExport = (format: 'pdf' | 'csv') => {
        const btn = document.getElementById(`export-${format}`);
        if (btn) {
            btn.innerHTML = 'Exporting...';
            btn.classList.add('opacity-50', 'cursor-not-allowed');

            setTimeout(() => {
                if (format === 'pdf') {
                    exportToPDF();
                } else {
                    exportToCSV();
                }
                btn.innerHTML = format === 'pdf' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-cloud w-4 h-4"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg> Export to PDF' : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-cloud w-4 h-4"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg> Export to CSV';
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }, 500);
        }
    };

    const handleDelete = async (reportId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this report?')) return;

        try {
            const res = await fetch(`${API_BASE}/v1/history/${reportId}`, { method: 'DELETE' });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== reportId));
            } else {
                console.error("Failed to delete report on server side");
            }
        } catch (err) {
            console.error("Failed to delete report:", err);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('Welding AI Analysis Report', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["Report ID", "Date", "Welds Scanned", "Defects Found", "Top Defect", "Status"];
        const tableRows = reports.map(report => [
            report.id.substring(0, 8),
            new Date(report.date).toLocaleString(),
            report.welds,
            report.defects,
            report.top_label,
            report.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] }, // primary-500
        });

        doc.save(`welding_reports_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportToCSV = () => {
        const headers = ["Report ID", "Date", "Audit Type", "Welds Scanned", "Defects Found", "Top Defect", "Severity", "Status"];
        const rows = reports.map(r => [
            r.id,
            new Date(r.date).toLocaleString(),
            r.type,
            r.welds,
            r.defects,
            r.top_label,
            r.severity,
            r.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `welding_reports_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout title="Reports & Export">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-dark-900 border border-white/10 rounded-2xl p-4">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search report ID, date, or type..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors whitespace-nowrap">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button id="export-csv" onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                            <DownloadCloud className="w-4 h-4" /> Export to CSV
                        </button>
                        <button id="export-pdf" onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all whitespace-nowrap">
                            <DownloadCloud className="w-4 h-4" /> Export to PDF
                        </button>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 text-sm font-semibold text-white/80">Report ID</th>
                                    <th className="p-4 text-sm font-semibold text-white/80">Date</th>
                                    <th className="p-4 text-sm font-semibold text-white/80">Audit Type</th>
                                    <th className="p-4 text-sm font-semibold text-white/80">Welds Scanned</th>
                                    <th className="p-4 text-sm font-semibold text-white/80">Defects Found</th>
                                    <th className="p-4 text-sm font-semibold text-white/80">Status</th>
                                    <th className="p-4 text-sm font-semibold text-white/80 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center">
                                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-white/40">
                                            No reports found.
                                        </td>
                                    </tr>
                                ) : reports.map((report, idx) => (
                                    <motion.tr
                                        key={report.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-4 text-sm font-medium text-white">{report.id}</td>
                                        <td className="p-4 text-sm text-white/60">{new Date(report.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm text-white/80">{report.type}</td>
                                        <td className="p-4 text-sm text-white/80">{report.welds}</td>
                                        <td className="p-4 text-sm font-medium">
                                            {report.defects > 0 ? (
                                                <span className="text-red-400">{report.defects}</span>
                                            ) : (
                                                <span className="text-white/60">0</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline - flex items - center gap - 1.5 px - 2.5 py - 1 rounded - full text - xs font - medium ${report.status === 'Completed'
                                                ? 'bg-secondary-500/10 text-secondary-400 border border-secondary-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                } `}>
                                                {report.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                {report.status}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="text-primary-400 hover:text-primary-300 text-sm font-medium border border-primary-500/30 px-3 py-1.5 rounded-lg bg-primary-500/10"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(report.id, e)}
                                                    className="text-red-400 hover:text-red-300 p-1.5 border border-red-500/30 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-white/10 flex justify-center bg-white/5">
                        <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                            Load More Reports
                        </button>
                    </div>
                </div>

            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h3 className="text-xl font-bold text-white">Report Details</h3>
                                <button onClick={() => setSelectedReport(null)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Report ID</p>
                                        <p className="text-white font-medium">{selectedReport.id.substring(0, 12)}...</p>
                                    </div>
                                    <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Date & Time</p>
                                        <p className="text-white font-medium">{new Date(selectedReport.date).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Audit Type</p>
                                        <p className="text-white font-medium">{selectedReport.type}</p>
                                    </div>
                                    <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Status</p>
                                        <p className={`font-medium ${selectedReport.status === 'Completed' ? 'text-secondary-400' : 'text-orange-400'}`}>
                                            {selectedReport.status}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-primary-900/20 border border-primary-500/20 p-5 rounded-xl">
                                    <h4 className="text-primary-400 font-medium mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Detection Summary
                                    </h4>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white/60 text-sm">Top Defect:</span>
                                        <span className="text-white font-semibold">{selectedReport.top_label}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white/60 text-sm">Severity:</span>
                                        <span className={`font-semibold ${selectedReport.severity === 'Normal' ? 'text-secondary-400' : 'text-red-400'}`}>
                                            {selectedReport.severity}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white/60 text-sm">Welds Scanned:</span>
                                        <span className="text-white font-semibold">{selectedReport.welds}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60 text-sm">Defects Found:</span>
                                        <span className="text-white font-semibold">{selectedReport.defects}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                <button onClick={() => setSelectedReport(null)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                                    Close
                                </button>
                                <button className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-all">
                                    Re-run Analysis
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
