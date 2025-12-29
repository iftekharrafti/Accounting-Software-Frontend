import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { incomeAPI, categoryAPI, bankAccountAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IncomeModal({ isOpen, onClose, income, onSuccess }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    categoryId: '',
    bankAccountId: '',
    incomeDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending',
    paymentMethod: '',
    clientName: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchBankAccounts();
      if (income) {
        setFormData({
          title: income.title || '',
          description: income.description || '',
          amount: income.amount || '',
          categoryId: income.categoryId || '',
          bankAccountId: income.bankAccountId || '',
          incomeDate: income.incomeDate?.split('T')[0] || new Date().toISOString().split('T')[0],
          paymentStatus: income.paymentStatus || 'pending',
          paymentMethod: income.paymentMethod || '',
          clientName: income.clientName || '',
          notes: income.notes || ''
        });
      }
    }
  }, [isOpen, income]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({ profileId: profile.id, type: 'income', limit: 100 });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await bankAccountAPI.getAll({ profileId: profile.id, limit: 100 });
      setBankAccounts(response.data.data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, profileId: profile.id };
      if (income) {
        await incomeAPI.update(income.id, data);
        toast.success('Income updated successfully');
      } else {
        await incomeAPI.create(data);
        toast.success('Income created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{income ? 'Edit Income' : 'Add Income'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input" placeholder="Income title" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="input" placeholder="0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" required value={formData.incomeDate} onChange={(e) => setFormData({...formData, incomeDate: e.target.value})} className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="input">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
              <select value={formData.bankAccountId} onChange={(e) => setFormData({...formData, bankAccountId: e.target.value})} className="input">
                <option value="">Select Account</option>
                {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})} className="input">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <input type="text" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="input" placeholder="Cash, Bank Transfer, etc." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
              <input type="text" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="input" placeholder="Client name" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" rows="3" placeholder="Add description..."></textarea>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input" rows="2" placeholder="Additional notes..."></textarea>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="flex-1 btn btn-primary disabled:opacity-50">
              {loading ? 'Saving...' : income ? 'Update Income' : 'Create Income'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}