
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { budgetAPI, categoryAPI } from '../../services/api';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BudgetModal({ isOpen, onClose, budget, onSuccess }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgetType: 'monthly',
    totalAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    alertThreshold: 80,
    status: 'active'
  });
  const [budgetCategories, setBudgetCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (budget) {
        setFormData({
          name: budget.name || '',
          description: budget.description || '',
          budgetType: budget.budgetType || 'monthly',
          totalAmount: budget.totalAmount || '',
          startDate: budget.startDate?.split('T')[0] || '',
          endDate: budget.endDate?.split('T')[0] || '',
          alertThreshold: budget.alertThreshold || 80,
          status: budget.status || 'active'
        });
        setBudgetCategories(budget.budgetCategories?.map(bc => ({
          categoryId: bc.categoryId,
          allocatedAmount: bc.allocatedAmount,
          notes: bc.notes || ''
        })) || []);
      }
    }
  }, [isOpen, budget]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({ profileId: profile.id, type: 'expense', limit: 100 });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addCategoryAllocation = () => {
    setBudgetCategories([...budgetCategories, { categoryId: '', allocatedAmount: '', notes: '' }]);
  };

  const removeCategoryAllocation = (index) => {
    setBudgetCategories(budgetCategories.filter((_, i) => i !== index));
  };

  const updateCategoryAllocation = (index, field, value) => {
    const updated = [...budgetCategories];
    updated[index][field] = value;
    setBudgetCategories(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, profileId: profile.id, budgetCategories };
      if (budget) {
        await budgetAPI.update(budget.id, data);
        toast.success('Updated');
      } else {
        await budgetAPI.create(data);
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
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{budget ? 'Edit' : 'Add'} Budget</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium mb-2">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Total Amount *</label><input type="number" step="0.01" required value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Type</label><select value={formData.budgetType} onChange={(e) => setFormData({...formData, budgetType: e.target.value})} className="input"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></select></div>
            <div><label className="block text-sm font-medium mb-2">Start Date *</label><input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">End Date *</label><input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Alert Threshold (%)</label><input type="number" min="0" max="100" value={formData.alertThreshold} onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" rows="2"></textarea></div>
          </div>

          <div className="border-t pt-4"><div className="flex justify-between items-center mb-3"><h3 className="font-medium">Category Allocations</h3><button type="button" onClick={addCategoryAllocation} className="text-sm text-primary-600 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Category</button></div><div className="space-y-2">{budgetCategories.map((bc, idx) => (<div key={idx} className="flex gap-2 items-start p-3 border rounded"><select value={bc.categoryId} onChange={(e) => updateCategoryAllocation(idx, 'categoryId', e.target.value)} className="input flex-1"><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="number" step="0.01" placeholder="Amount" value={bc.allocatedAmount} onChange={(e) => updateCategoryAllocation(idx, 'allocatedAmount', e.target.value)} className="input w-32" /><button type="button" onClick={() => removeCategoryAllocation(idx)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div>))}</div></div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="flex-1 btn btn-primary disabled:opacity-50">{loading ? 'Saving...' : budget ? 'Update' : 'Create'}</button>
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}