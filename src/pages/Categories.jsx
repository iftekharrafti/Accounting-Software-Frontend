import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { categoryAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, FolderTree, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import CategoryModal from '../components/modals/CategoryModal';

export default function Categories() {
    const { profile } = useAuth();
    const [categories, setCategories] = useState([]);
    const [treeView, setTreeView] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [filters, setFilters] = useState({ search: '', type: '', isActive: '', page: 1, limit: 20 });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (profile?.id) {
            if (viewMode === 'tree') fetchTreeView();
            else fetchCategories();
            fetchStats();
        }
    }, [profile, filters, viewMode]);

    const fetchCategories = async () => {
        if (!profile?.id) return;
        try {
            setLoading(true);
            const response = await categoryAPI.getAll({ profileId: profile.id, ...filters });
            setCategories(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    const fetchTreeView = async () => {
        if (!profile?.id) return;
        try {
            setLoading(true);
            const response = await categoryAPI.getTree({ profileId: profile.id, type: filters.type });
            setTreeView(response.data.data);
        } catch (error) {
            toast.error('Failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await categoryAPI.getStats({ profileId: profile.id });
            setStats(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete category?')) return;
        try {
            await categoryAPI.delete(id, profile.id);
            toast.success('Deleted');
            viewMode === 'tree' ? fetchTreeView() : fetchCategories();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    const renderTreeNode = (node, level = 0) => (
        <div key={node.id} className="mb-2">
            <div className={`flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 ${level > 0 ? 'ml-8' : ''}`} style={{ borderLeft: `4px solid ${node.color}` }}>
                <div className="flex items-center gap-3"><span className="text-xl">{node.icon}</span><div><p className="font-medium">{node.name}</p><p className="text-xs text-gray-500">{node.type}</p></div></div>
                <div className="flex gap-2"><span className={`px-2 py-1 rounded text-xs ${node.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{node.isActive ? 'Active' : 'Inactive'}</span><button onClick={() => { setEditingCategory(node); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(node.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div>
            </div>
            {node.subcategories?.length > 0 && <div className="mt-2">{node.subcategories.map(sub => renderTreeNode(sub, level + 1))}</div>}
        </div>
    );

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-gray-600 mt-1">Organize income and expense categories</p></div>
                <div className="flex gap-3">
                    <button onClick={() => setViewMode(viewMode === 'list' ? 'tree' : 'list')} className="btn btn-secondary flex items-center gap-2">{viewMode === 'list' ? <FolderTree className="w-5 h-5" /> : <Tag className="w-5 h-5" />}{viewMode === 'list' ? 'Tree' : 'List'}</button>
                    <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total</p><p className="text-2xl font-bold">{stats?.total || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Income</p><p className="text-2xl font-bold text-green-600">{stats?.byType?.find(t => t.type === 'income')?.count || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Expense</p><p className="text-2xl font-bold text-red-600">{stats?.byType?.find(t => t.type === 'expense')?.count || 0}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Active</p><p className="text-2xl font-bold text-blue-600">{stats?.byStatus?.find(s => s.isActive === 1)?.count || 0}</p></div>
            </div>

            {viewMode === 'list' && (
                <div className="card"><div className="grid grid-cols-3 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="input pl-10" /></div><select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })} className="input"><option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option><option value="both">Both</option></select><select value={filters.isActive} onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })} className="input"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select></div></div>
            )}

            <div className="card">
                {loading ? <div className="py-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div> : viewMode === 'tree' ? (
                    <div>{treeView.length > 0 ? treeView.map(node => renderTreeNode(node)) : <p className="py-12 text-center text-gray-500">No categories</p>}</div>
                ) : (
                    <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Parent</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th></tr></thead><tbody>{categories.length > 0 ? categories.map((cat) => (<tr key={cat.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4"><div className="flex items-center gap-3"><span className="text-2xl">{cat.icon}</span><div><p className="font-medium">{cat.name}</p>{cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}</div></div></td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${cat.type === 'income' ? 'bg-green-100 text-green-700' : cat.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{cat.type}</span></td><td className="py-3 px-4 text-sm">{cat.parent?.name || '-'}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td><td className="py-3 px-4"><div className="flex justify-center gap-2"><button onClick={() => { setEditingCategory(cat); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>{!cat.isSystem && <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>}</div></td></tr>)) : <tr><td colSpan="5" className="py-12 text-center text-gray-500">No categories</td></tr>}</tbody></table>{pagination?.totalPages > 1 && <div className="flex justify-between mt-4 pt-4 border-t"><p className="text-sm text-gray-600">Showing {categories.length} of {pagination.totalItems}</p><div className="flex gap-2"><button disabled={!pagination.hasPrevPage} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button><span className="px-3 py-1">Page {pagination.currentPage}</span><button disabled={!pagination.hasNextPage} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-3 py-1 border rounded disabled:opacity-50">Next</button></div></div>}</div>
                )}
            </div>

            {modalOpen && <CategoryModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingCategory(null); }} category={editingCategory} onSuccess={() => { viewMode === 'tree' ? fetchTreeView() : fetchCategories(); fetchStats(); setModalOpen(false); setEditingCategory(null); }} />}
        </div>
    );
}