import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { bankAccountAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BankAccountModal({ isOpen, onClose, account, onSuccess }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'checking',
    accountNumber: '',
    bankName: '',
    branchName: '',
    initialBalance: '',
    currentBalance: '',
    currency: 'BDT',
    isDefault: false,
    isActive: true,
    notes: ''
  });

  useEffect(() => {
    if (isOpen && account) {
      setFormData({
        accountName: account.accountName || '',
        accountType: account.accountType || 'checking',
        accountNumber: account.accountNumber || '',
        bankName: account.bankName || '',
        branchName: account.branchName || '',
        initialBalance: account.initialBalance || '',
        currentBalance: account.currentBalance || '',
        currency: account.currency || 'BDT',
        isDefault: account.isDefault || false,
        isActive: account.isActive !== undefined ? account.isActive : true,
        notes: account.notes || ''
      });
    }
  }, [isOpen, account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, profileId: profile.id };
      if (account) {
        await bankAccountAPI.update(account.id, data);
        toast.success('Updated');
      } else {
        await bankAccountAPI.create(data);
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
          <h2 className="text-xl font-semibold">{account ? 'Edit' : 'Add'} Bank Account</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium mb-2">Account Name *</label><input type="text" required value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} className="input" placeholder="My Checking Account" /></div>
            <div><label className="block text-sm font-medium mb-2">Account Type *</label><select required value={formData.accountType} onChange={(e) => setFormData({...formData, accountType: e.target.value})} className="input"><option value="checking">Checking</option><option value="savings">Savings</option><option value="credit_card">Credit Card</option><option value="cash">Cash</option><option value="investment">Investment</option><option value="loan">Loan</option><option value="other">Other</option></select></div>
            <div><label className="block text-sm font-medium mb-2">Account Number</label><input type="text" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Bank Name</label><input type="text" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Branch Name</label><input type="text" value={formData.branchName} onChange={(e) => setFormData({...formData, branchName: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Initial Balance</label><input type="number" step="0.01" value={formData.initialBalance} onChange={(e) => setFormData({...formData, initialBalance: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium mb-2">Current Balance</label><input type="number" step="0.01" value={formData.currentBalance} onChange={(e) => setFormData({...formData, currentBalance: e.target.value})} className="input" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-2">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input" rows="2"></textarea></div>
            <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Default Account</span></label></div>
            <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Active</span></label></div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="flex-1 btn btn-primary disabled:opacity-50">{loading ? 'Saving...' : account ? 'Update' : 'Create'}</button>
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}