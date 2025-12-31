import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { incomeAPI, categoryAPI, bankAccountAPI } from '../services/api';
import { Plus, Search, Filter, Edit2, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import IncomeModal from '../components/modals/IncomeModal';

export default function Income() {
    const { profile } = useAuth();
    const [incomes, setIncomes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        categoryId: '',
        paymentStatus: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (profile?.id) {
            fetchIncomes();
            fetchCategories();
            fetchStats();
        }
    }, [profile, filters]);

    const fetchIncomes = async () => {
        if (!profile?.id) return;
        try {
            setLoading(true);
            const params = { profileId: profile.id, ...filters };
            const response = await incomeAPI.getAll(params);
            setIncomes(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch incomes');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll({ profileId: profile.id, type: 'income', limit: 100 });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await incomeAPI.getStats({ profileId: profile.id });
            setStats(response.data.data.summary);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this income?')) return;
        try {
            await incomeAPI.delete(id, profile.id);
            toast.success('Income deleted successfully');
            fetchIncomes();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete income');
        }
    };

    const handleEdit = (income) => {
        setEditingIncome(income);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingIncome(null);
    };

    const handleSuccess = () => {
        fetchIncomes();
        fetchStats();
        handleModalClose();
    };

    const formatCurrency = (amount) => {
        return `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Income Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage all your income sources</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add Income
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card">
                    <p className="text-sm text-gray-600 mb-2">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalAmount)}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600 mb-2">Total Count</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalCount || 0}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600 mb-2">Average</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.averageAmount)}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600 mb-2">Highest</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats?.maxAmount)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Search incomes..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="input pl-10" />
                    </div>
                    <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })} className="input">
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <select value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value, page: 1 })} className="input">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                    </select>
                    <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })} className="input" />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
                            ) : incomes.length > 0 ? (
                                incomes.map((income) => (
                                    <tr key={income.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">{format(new Date(income.incomeDate), 'MMM dd, yyyy')}</td>
                                        <td className="py-3 px-4"><p className="text-sm font-medium text-gray-900">{income.title}</p>{income.description && <p className="text-xs text-gray-500 truncate">{income.description}</p>}</td>
                                        <td className="py-3 px-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${income.category?.color}20`, color: income.category?.color }}>{income.category?.icon} {income.category?.name}</span></td>
                                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${income.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{income.paymentStatus}</span></td>
                                        <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">{formatCurrency(income.amount)}</td>
                                        <td className="py-3 px-4"><div className="flex items-center justify-center gap-2"><button onClick={() => handleEdit(income)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(income.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No incomes found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Showing {incomes.length} of {pagination.totalItems} results</p>
                        <div className="flex gap-2">
                            <button disabled={!pagination.hasPrevPage} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                            <button disabled={!pagination.hasNextPage} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {modalOpen && <IncomeModal isOpen={modalOpen} onClose={handleModalClose} income={editingIncome} onSuccess={handleSuccess} />}
        </div>
    );
}