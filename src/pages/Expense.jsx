import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { expenseAPI, categoryAPI, vendorAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ExpenseModal from '../components/modals/ExpenseModal';

export default function Expense() {
    const { profile } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        categoryId: '',
        vendorId: '',
        paymentStatus: '',
        status: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (profile?.id) {
            fetchExpenses();
            fetchCategories();
            fetchVendors();
            fetchStats();
        }
    }, [profile, filters]);

    const fetchExpenses = async () => {
        if (!profile?.id) return;
        try {
            setLoading(true);
            const params = { profileId: profile.id, ...filters };
            const response = await expenseAPI.getAll(params);
            setExpenses(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll({ profileId: profile.id, type: 'expense', limit: 100 });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await vendorAPI.getAll({ profileId: profile.id, limit: 100 });
            setVendors(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await expenseAPI.getStats({ profileId: profile.id });
            setStats(response.data.data.summary);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this expense?')) return;
        try {
            await expenseAPI.delete(id, profile.id);
            toast.success('Deleted successfully');
            fetchExpenses();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleApprove = async (expense) => {
        try {
            await expenseAPI.approve(expense.id, profile.id);
            toast.success('Approved');
            fetchExpenses();
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleReject = async (expense) => {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        try {
            await expenseAPI.reject(expense.id, { rejectionReason: reason }, profile.id);
            toast.success('Rejected');
            fetchExpenses();
        } catch (error) {
            toast.error('Failed');
        }
    };

    const formatCurrency = (amount) => {
        return `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                    <p className="text-gray-600 mt-1">Track and manage expenses</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Expense</p><p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.totalAmount)}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Count</p><p className="text-2xl font-bold text-gray-900">{stats?.totalCount || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Average</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.averageAmount)}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Pending</p><p className="text-2xl font-bold text-orange-600">{expenses.filter(e => e.status === 'pending').length}</p></div>
            </div>

            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="input pl-10" /></div>
                    <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })} className="input"><option value="">All Categories</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
                    <select value={filters.vendorId} onChange={(e) => setFilters({ ...filters, vendorId: e.target.value, page: 1 })} className="input"><option value="">All Vendors</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}</select>
                    <select value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value, page: 1 })} className="input"><option value="">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option></select>
                </div>
            </div>

            <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-200"><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th><th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr> : expenses.length > 0 ? expenses.map((expense) => (<tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="py-3 px-4 text-sm">{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</td><td className="py-3 px-4"><p className="text-sm font-medium">{expense.title}</p></td><td className="py-3 px-4">{expense.category && <span className="inline-flex px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${expense.category.color}20`, color: expense.category.color }}>{expense.category.name}</span>}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${expense.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{expense.paymentStatus}</span></td><td className="py-3 px-4 text-right font-semibold text-red-600">{formatCurrency(expense.amount)}</td><td className="py-3 px-4"><div className="flex justify-center gap-2">{expense.status === 'pending' && <><button onClick={() => handleApprove(expense)} className="p-2 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button><button onClick={() => handleReject(expense)} className="p-2 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-4 h-4" /></button></>}<button onClick={() => { setEditingExpense(expense); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(expense.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td></tr>)) : <tr><td colSpan="6" className="py-8 text-center text-gray-500">No expenses</td></tr>}</tbody></table></div></div>

            {modalOpen && <ExpenseModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingExpense(null); }} expense={editingExpense} onSuccess={() => { fetchExpenses(); fetchStats(); setModalOpen(false); setEditingExpense(null); }} />}
        </div>
    );
}

