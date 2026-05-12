import { useState, useEffect, useCallback } from 'react'
import { X, Users, Search, Download, Trash2, ChevronUp, ChevronDown, LayoutGrid, Table2, RefreshCw, AlertCircle, Eye, Home } from 'lucide-react'

import API from '../config'

function useRegistrations() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`${API}/registrations?limit=500`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setData(json.data)
    } catch (e) {
      setError(e.message || 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  async function remove(id) {
    try {
      const res = await fetch(`${API}/registrations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setData(d => d.filter(r => r.id !== id))
    } catch (e) {
      alert(e.message)
    }
  }

  return { data, loading, error, refetch: fetch_, remove }
}

const COLS = [
  { key: 'name',          label: 'Full Name' },
  { key: 'organization',  label: 'Organization' },
  { key: 'title',         label: 'Title' },
  { key: 'business_type', label: 'Business Type' },
  { key: 'email',         label: 'Email' },
  { key: 'phone',         label: 'Phone' },
  { key: 'created_at',    label: 'Registered', fmt: v => new Date(v).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) },
]

export default function AdminPortal({ onClose }) {
  const { data, loading, error, refetch, remove } = useRegistrations()
  const [view, setView]       = useState('cards') // 'cards' | 'table'
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage]       = useState(1)
  const [previewId, setPreviewId]       = useState(null)
  const [confirmId, setConfirmId]       = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl]     = useState(null)
  const [pdfLoading, setPdfLoading]     = useState(false)
  const [pdfError, setPdfError]         = useState('')

  useEffect(() => {
    if (!previewId) {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
      setPdfBlobUrl(null)
      setPdfError('')
      return
    }
    setPdfLoading(true)
    setPdfError('')
    fetch(`${API}/registrations/${previewId}/idcard.pdf`)
      .then(r => {
        if (!r.ok) throw new Error('PDF not ready yet — please try again in a moment')
        return r.blob()
      })
      .then(blob => {
        const url = URL.createObjectURL(blob)
        setPdfBlobUrl(url)
      })
      .catch(e => setPdfError(e.message))
      .finally(() => setPdfLoading(false))
  }, [previewId])
  const PER_PAGE = view === 'cards' ? 6 : 10

  const filtered = data.filter(r =>
    Object.values(r).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  )

  const sorted = [...filtered].sort((a, b) => {
    const va = String(a[sortKey] ?? '').toLowerCase()
    const vb = String(b[sortKey] ?? '').toLowerCase()
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function sort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  function exportCSV() {
    const headers = COLS.map(c => c.label).join(',')
    const rows = data.map(r =>
      COLS.map(c => `"${(c.fmt ? c.fmt(r[c.key]) : r[c.key]) ?? ''}"` ).join(',')
    ).join('\n')
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'registrations.csv'; a.click()
  }

  return (
    <div className="fixed inset-0 z-[90] bg-gray-50 flex flex-col overflow-hidden">

      {/* Delete Confirmation Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Delete Registration</p>
                <p className="text-sm text-gray-500">This will permanently remove the record and its ID card PDF.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { remove(confirmId); setConfirmId(null) }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewId && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl" style={{ height: '90vh' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <span className="font-semibold text-gray-700 text-sm">ID Card Preview</span>
              <button
                onClick={() => setPreviewId(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {pdfLoading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                <RefreshCw size={28} className="animate-spin opacity-50" />
                <p className="text-sm">Generating ID card PDF…</p>
              </div>
            )}

            {pdfError && !pdfLoading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-sm text-red-500">{pdfError}</p>
              </div>
            )}

            {pdfBlobUrl && !pdfLoading && (
              <iframe
                src={pdfBlobUrl}
                className="flex-1 w-full rounded-b-2xl"
                title="ID Card PDF"
              />
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-[#0D6731] border border-[#0D6731] rounded-lg hover:bg-white hover:text-[#0D6731] transition-all duration-200 mr-2 shadow-sm cursor-pointer"
          >
            <Home size={18} />
            Home
          </button>
          <div className="w-9 h-9 rounded-lg bg-[#0D6731]/10 flex items-center justify-center">
            <Users size={18} className="text-[#0D6731]" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">Admin Portal</h1>
            <p className="text-xs text-gray-400">{loading ? 'Loading...' : `${data.length} registrations total`}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="p-2 rounded-lg text-gray-400 hover:text-[#0D6731] hover:bg-[#0D6731]/5 transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#0D6731] border border-[#0D6731]/30 rounded-lg hover:bg-[#0D6731]/5 transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 sm:px-8 py-3 bg-white border-b border-gray-100 flex flex-wrap items-center gap-3 flex-shrink-0">
        {/* Search */}
        <div className="flex-1 min-w-[160px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search registrations..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#0D6731] outline-none transition"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setView('cards')}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition ${view === 'cards' ? 'bg-[#0D6731] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={15} /> Cards
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition ${view === 'table' ? 'bg-[#0D6731] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <Table2 size={15} /> Table
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-400">
            <RefreshCw size={32} className="animate-spin opacity-40" />
            <p className="text-sm">Loading registrations...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <AlertCircle size={36} className="text-red-400 opacity-70" />
            <p className="font-medium text-red-500">{error}</p>
            <button onClick={refetch} className="text-sm text-[#0D6731] underline">Try again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-gray-400">
            <Users size={40} className="opacity-30" />
            <p className="font-medium">{search ? 'No results found' : 'No registrations yet'}</p>
            <p className="text-sm">{search ? 'Try a different search term' : 'Registrations will appear here'}</p>
          </div>
        )}

        {/* Card View */}
        {view === 'cards' && paged.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-[#0D6731] shadow-sm p-5 hover:shadow-md transition-shadow relative group">
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    onClick={() => setPreviewId(r.id)}
                    className="p-2 rounded-lg text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100 transition-all duration-200 hover:scale-110 cursor-pointer"
                    title="Preview ID Card"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmId(r.id)}
                    className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-110 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0D6731]/10 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    {r.photo
                      ? <img src={r.photo} alt={r.name} className="w-full h-full object-cover" />
                      : <span className="text-[#0D6731] font-bold text-sm">{r.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-gray-500 truncate">{r.title}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-gray-600">
                  <Row label="Org" value={r.organization} />
                  <Row label="Industry" value={r.business_type} />
                  <Row label="Email" value={r.email} mono />
                  <Row label="Phone" value={r.phone} />
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                  Registered {new Date(r.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {view === 'table' && paged.length > 0 && (
          <div className="bg-white rounded-xl border border-[#0D6731] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {COLS.map(c => (
                    <th
                      key={c.key}
                      onClick={() => sort(c.key)}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-[#0D6731] whitespace-nowrap"
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {sortKey === c.key
                          ? sortDir === 'asc' ? <ChevronUp size={12} className="text-[#0D6731]" /> : <ChevronDown size={12} className="text-[#0D6731]" />
                          : <ChevronUp size={12} className="text-gray-300" />}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, idx) => (
                  <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    {COLS.map(c => (
                      <td key={c.key} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[180px] truncate">
                        {c.fmt ? c.fmt(r[c.key]) : r[c.key] || '—'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPreviewId(r.id)}
                          className="p-2 rounded-lg text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100 transition-all duration-200 hover:scale-110 cursor-pointer"
                          title="Preview ID Card"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmId(r.id)}
                          className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-110 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 px-4 sm:px-8 py-3 border-t border-gray-200 bg-white flex items-center justify-between text-sm text-gray-500">
          <span>{sorted.length} results</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition text-xs"
            >
              Previous
            </button>
            <span className="text-xs">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-gray-400 w-12 flex-shrink-0">{label}:</span>
      <span className={`truncate ${mono ? 'font-mono text-[11px]' : ''}`}>{value || '—'}</span>
    </div>
  )
}
