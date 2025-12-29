import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { budgetAPI, categoryAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, TrendingUp, Target } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import BudgetModal from '../components/modals/BudgetModal';

export default function Budgets() {
    const { profile } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [performanceView, setPerformanceView] = useState(null);
    const [filters, setFilters] = useState({ search: '', budgetType: '', status: '', page: 1, limit: 10 });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (profile?.id) { fetchBudgets(); fetchStats(); }
    }, [profile, filters]);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const response = await budgetAPI.getAll({ profileId: profile.id, ...filters });
            setBudgets(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await budgetAPI.getStats({ profileId: profile.id });
            setStats(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete budget?')) return;
        try {
            await budgetAPI.delete(id, profile.id);
            toast.success('Deleted');
            fetchBudgets();
            fetchStats();
        } catch (error) {
            toast.error('Failed');
        }
    };

    const fetchPerformance = async (budget) => {
        try {
            const response = await budgetAPI.getPerformance(budget.id, profile.id);
            setPerformanceView(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch performance');
        }
    };

    const formatCurrency = (amount) => `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Budgets</h1><p className="text-gray-600 mt-1">Track and manage budgets</p></div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Budget</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Budgets</p><p className="text-2xl font-bold">{stats?.total || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Active</p><p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Monthly</p><p className="text-2xl font-bold text-blue-600">{stats?.byType?.find(t => t.budgetType === 'monthly')?.count || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Yearly</p><p className="text-2xl font-bold text-purple-600">{stats?.byType?.find(t => t.budgetType === 'yearly')?.count || 0}</p></div>
            </div>

            <div className="card"><div className="grid grid-cols-3 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="input pl-10" /></div><select value={filters.budgetType} onChange={(e) => setFilters({ ...filters, budgetType: e.target.value, page: 1 })} className="input"><option value="">All Types</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="input"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>

            <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Period</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th><th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr> : budgets.length > 0 ? budgets.map((budget) => (<tr key={budget.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4"><p className="font-medium">{budget.name}</p>{budget.description && <p className="text-xs text-gray-500">{budget.description}</p>}</td><td className="py-3 px-4 text-sm">{format(new Date(budget.startDate), 'MMM dd')} - {format(new Date(budget.endDate), 'MMM dd, yyyy')}</td><td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{budget.budgetType}</span></td><td className="py-3 px-4 text-right font-semibold">{formatCurrency(budget.totalAmount)}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${budget.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{budget.status}</span></td><td className="py-3 px-4"><div className="flex justify-center gap-2"><button onClick={() => fetchPerformance(budget)} className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="Performance"><Target className="w-4 h-4" /></button><button onClick={() => { setEditingBudget(budget); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(budget.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td></tr>)) : <tr><td colSpan="6" className="py-12 text-center text-gray-500">No budgets</td></tr>}</tbody></table></div></div>

            {performanceView && (
                <div className="card"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Budget Performance: {performanceView.budget.name}</h3><button onClick={() => setPerformanceView(null)} className="text-sm text-gray-600">Close</button></div><div className="grid grid-cols-4 gap-4 mb-4"><div className="p-4 bg-blue-50 rounded"><p className="text-sm text-gray-600">Allocated</p><p className="text-xl font-bold text-blue-600">{formatCurrency(performanceView.budget.totalAllocated)}</p></div><div className="p-4 bg-red-50 rounded"><p className="text-sm text-gray-600">Spent</p><p className="text-xl font-bold text-red-600">{formatCurrency(performanceView.budget.totalSpent)}</p></div><div className="p-4 bg-green-50 rounded"><p className="text-sm text-gray-600">Remaining</p><p className="text-xl font-bold text-green-600">{formatCurrency(performanceView.budget.totalRemaining)}</p></div><div className="p-4 bg-purple-50 rounded"><p className="text-sm text-gray-600">Used</p><p className="text-xl font-bold text-purple-600">{performanceView.budget.overallPercentage}%</p></div></div><div className="space-y-2">{performanceView.categoryPerformance.map((cat, idx) => (<div key={idx} className="p-3 border rounded"><div className="flex justify-between mb-2"><span className="font-medium">{cat.categoryName}</span><span className={`text-sm ${cat.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>{cat.percentageUsed}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${cat.isOverBudget ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${Math.min(cat.percentageUsed, 100)}%` }}></div></div><div className="flex justify-between mt-2 text-xs text-gray-600"><span>Spent: {formatCurrency(cat.actualSpent)}</span><span>Budget: {formatCurrency(cat.allocatedAmount)}</span></div></div>))}</div></div>
            )}

            {modalOpen && <BudgetModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingBudget(null); }} budget={editingBudget} onSuccess={() => { fetchBudgets(); fetchStats(); setModalOpen(false); setEditingBudget(null); }} />}
        </div>
    );
}
