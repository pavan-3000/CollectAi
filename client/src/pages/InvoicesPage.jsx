import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const FILTERS = ['all', 'pending', 'paid', 'overdue'];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/invoices')
      .then(res => setInvoices(res.data.invoices))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    await api.delete('/invoices/' + id);
    setInvoices(prev => prev.filter(i => i._id !== id));
  };

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  const counts = {
    all: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Invoices</h1>
            <p className="text-slate-500 mt-1 text-sm">{invoices.length} total invoices</p>
          </div>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 border border-white/5 hover:border-indigo-500/40 hover:text-white'
              }`}
            >
              {f}{' '}
              <span className={`ml-1 text-xs ${filter === f ? 'text-indigo-200' : 'text-slate-600'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center px-6">
              <svg className="w-10 h-10 text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 font-medium text-sm">No {filter !== 'all' ? filter : ''} invoices</p>
              {filter === 'all' && (
                <Link to="/invoices/new" className="mt-3 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Create your first invoice
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(inv => (
                <div
                  key={inv._id}
                  onClick={() => navigate('/invoices/' + inv._id)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold border ${
                      inv.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : inv.status === 'overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {inv.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">{inv.clientName}</p>
                        {inv.recipientOnPlatform && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            On platform
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{inv.clientEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-white text-sm">₹{inv.amount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500">Due {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <p className="font-bold text-white text-sm sm:hidden">₹{inv.amount.toLocaleString('en-IN')}</p>
                    <StatusBadge status={inv.status} />
                    <button
                      onClick={(e) => handleDelete(inv._id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-500/10"
                      title="Delete invoice"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
