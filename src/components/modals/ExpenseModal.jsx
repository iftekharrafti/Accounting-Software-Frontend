import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { expenseAPI, categoryAPI, bankAccountAPI, vendorAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpenseModal({ isOpen, onClose, expense, onSuccess }) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        categoryId: '',
        vendorId: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending',
        approvalRequired: false
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchVendors();
            if (expense) {
                setFormData({
                    title: expense.title || '',
                    description: expense.description || '',
                    amount: expense.amount || '',
                    categoryId: expense.categoryId || '',
                    vendorId: expense.vendorId || '',
                    expenseDate: expense.expenseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                    paymentStatus: expense.paymentStatus || 'pending',
                    approvalRequired: expense.approvalRequired || false
                });
            }
        }
    }, [isOpen, expense]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...formData, profileId: profile.id };
            if (expense) {
                await expenseAPI.update(expense.id, data);
                toast.success('Updated');
            } else {
                await expenseAPI.create(data);
                toast.success('Created');
            }
            onSuccess();
        } catch (error) {
            toast.error('Failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{expense ? 'Edit' : 'Add'} Expense</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Amount *</label><input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Date *</label><input type="date" required value={formData.expenseDate} onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Category *</label><select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="input"><option value="">Select</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-2">Vendor</label><select value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} className="input"><option value="">Select</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-2">Status</label><select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="input"><option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option></select></div>
                        <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.approvalRequired} onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Approval Required</span></label></div>
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" rows="3"></textarea></div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 btn btn-primary disabled:opacity-50">{loading ? 'Saving...' : expense ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}