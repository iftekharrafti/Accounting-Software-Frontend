import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { categoryAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoryModal({ isOpen, onClose, category, onSuccess }) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'expense',
        parentId: '',
        color: '#3b82f6',
        icon: '💰',
        budgetAmount: '',
        isActive: true
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (category) {
                setFormData({
                    name: category.name || '',
                    description: category.description || '',
                    type: category.type || 'expense',
                    parentId: category.parentId || '',
                    color: category.color || '#3b82f6',
                    icon: category.icon || '💰',
                    budgetAmount: category.budgetAmount || '',
                    isActive: category.isActive !== undefined ? category.isActive : true
                });
            }
        }
    }, [isOpen, category]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll({ profileId: profile.id, limit: 100 });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...formData, profileId: profile.id };
            if (category) {
                await categoryAPI.update(category.id, data);
                toast.success('Updated');
            } else {
                await categoryAPI.create(data);
                toast.success('Created');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{category ? 'Edit' : 'Add'} Category</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Type *</label><select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input"><option value="income">Income</option><option value="expense">Expense</option><option value="both">Both</option></select></div>
                        <div><label className="block text-sm font-medium mb-2">Parent Category</label><select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} className="input"><option value="">None (Root)</option>{categories.filter(c => c.id !== category?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-2">Icon</label><input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="input" placeholder="💰 📊 🏠" /></div>
                        <div><label className="block text-sm font-medium mb-2">Color</label><input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="input h-10" /></div>
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Budget Amount</label><input type="number" step="0.01" value={formData.budgetAmount} onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })} className="input" placeholder="0.00" /></div>
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" rows="3"></textarea></div>
                        <div className="col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Active</span></label></div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 btn btn-primary disabled:opacity-50">{loading ? 'Saving...' : category ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}