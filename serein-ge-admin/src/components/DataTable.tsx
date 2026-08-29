import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  onExportCSV?: () => void;
  exportFileName?: string;
  pageSize?: number;
  actions?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Rechercher...',
  searchFilter,
  onExportCSV,
  exportFileName = 'export-serein.csv',
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchQuery || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, searchQuery));
  }, [data, searchQuery, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleExport = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    // Default CSV exporter
    const headers = columns.map((c) => c.header).join(',');
    const rows = filteredData.map((item: any) => {
      return columns
        .map((c) => {
          const val = c.accessor ? item[c.accessor] : '';
          return `"${String(val || '').replace(/"/g, '""')}"`;
        })
        .join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {searchFilter && (
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition"
            title="Exporter les données au format CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="py-3.5 px-5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  {columns.map((col, idx) => (
                    <td key={idx} className="py-3.5 px-5 text-slate-200">
                      {col.render ? col.render(item) : col.accessor ? String((item as any)[col.accessor] ?? '') : ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-500 text-xs">
                  Aucun élément correspondant trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Total : <strong>{filteredData.length}</strong> enregistrement(s)
        </div>

        <div className="flex items-center space-x-2">
          <span>Page {currentPage} sur {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
