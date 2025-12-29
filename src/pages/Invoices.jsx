import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { invoiceAPI, clientAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Invoices() {
    const { profile } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', clientId: '', status: '', paymentStatus: '', page: 1, limit: 10 });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (profile?.id) { fetchInvoices(); fetchStats(); }
    }, [profile, filters]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getAll({ profileId: profile.id, ...filters });
            setInvoices(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await invoiceAPI.getStats({ profileId: profile.id });
            setStats(response.data.data.summary);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete invoice?')) return;
        try {
            await invoiceAPI.delete(id, profile.id);
            toast.success('Deleted');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            toast.error('Failed');
        }
    };

    const formatCurrency = (amount) => `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Invoices</h1><p className="text-gray-600 mt-1">Manage invoices</p></div>
                <button className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Create Invoice</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Invoices</p><p className="text-2xl font-bold">{stats?.totalCount || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Amount</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.totalAmount)}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Paid</p><p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.paidAmount)}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Pending</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(parseFloat(stats?.totalAmount || 0) - parseFloat(stats?.paidAmount || 0))}</p></div>
            </div>

            <div className="card"><div className="grid grid-cols-4 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="input pl-10" /></div><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="input"><option value="">All Status</option><option value="draft">Draft</option><option value="sent">Sent</option><option value="viewed">Viewed</option><option value="paid">Paid</option></select><select value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value, page: 1 })} className="input"><option value="">Payment Status</option><option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select><input type="date" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })} className="input" placeholder="Date" /></div></div>

            <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Invoice #</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th><th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr> : invoices.length > 0 ? invoices.map((invoice) => (<tr key={invoice.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /><span className="font-mono font-medium">{invoice.invoiceNumber}</span></div></td><td className="py-3 px-4"><p className="font-medium">{invoice.client?.companyName || invoice.client?.contactPerson}</p><p className="text-xs text-gray-500">{invoice.client?.email}</p></td><td className="py-3 px-4 text-sm">{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</td><td className="py-3 px-4 text-right font-semibold">{formatCurrency(invoice.totalAmount)}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : invoice.paymentStatus === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{invoice.paymentStatus}</span></td><td className="py-3 px-4"><div className="flex justify-center gap-2"><button className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="View"><Eye className="w-4 h-4" /></button><button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(invoice.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td></tr>)) : <tr><td colSpan="6" className="py-12 text-center text-gray-500">No invoices</td></tr>}</tbody></table></div></div>
        </div>
    );
}