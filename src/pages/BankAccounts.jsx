import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bankAccountAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, Building2, CreditCard, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import BankAccountModal from '../components/modals/BankAccountModal';

export default function BankAccounts() {
  const { profile } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [balanceView, setBalanceView] = useState(null);
  const [filters, setFilters] = useState({ search: '', accountType: '', isActive: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (profile?.id) fetchAccounts();
  }, [profile, filters]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await bankAccountAPI.getAll({ profileId: profile.id, ...filters });
      setAccounts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete account?')) return;
    try {
      await bankAccountAPI.delete(id, profile.id);
      toast.success('Deleted');
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const fetchBalance = async (account) => {
    try {
      const response = await bankAccountAPI.getBalance(account.id, profile.id);
      setBalanceView(response.data.data);
    } catch (error) {
      toast.error('Failed');
    }
  };

  const formatCurrency = (amount) => `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || 0), 0);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Bank Accounts</h1><p className="text-gray-600 mt-1">Manage bank accounts and balances</p></div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Account</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Accounts</p><p className="text-2xl font-bold">{accounts.length}</p></div>
        <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Balance</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalBalance)}</p></div>
        <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Active Accounts</p><p className="text-2xl font-bold text-blue-600">{accounts.filter(a => a.isActive).length}</p></div>
      </div>

      <div className="card"><div className="grid grid-cols-3 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})} className="input pl-10" /></div><select value={filters.accountType} onChange={(e) => setFilters({...filters, accountType: e.target.value, page: 1})} className="input"><option value="">All Types</option><option value="checking">Checking</option><option value="savings">Savings</option><option value="credit_card">Credit Card</option><option value="cash">Cash</option></select><select value={filters.isActive} onChange={(e) => setFilters({...filters, isActive: e.target.value, page: 1})} className="input"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select></div></div>

      <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Account</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Account Number</th><th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Balance</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr> : accounts.length > 0 ? accounts.map((acc) => (<tr key={acc.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4"><div className="flex items-center gap-3">{acc.accountType === 'credit_card' ? <CreditCard className="w-5 h-5 text-purple-600" /> : acc.accountType === 'cash' ? <Wallet className="w-5 h-5 text-green-600" /> : <Building2 className="w-5 h-5 text-blue-600" />}<div><p className="font-medium">{acc.accountName}</p><p className="text-xs text-gray-500">{acc.bankName}</p></div></div></td><td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{acc.accountType}</span></td><td className="py-3 px-4 text-sm font-mono">{acc.accountNumber}</td><td className="py-3 px-4 text-right font-semibold text-green-600">{formatCurrency(acc.currentBalance)}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${acc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{acc.isActive ? 'Active' : 'Inactive'}</span></td><td className="py-3 px-4"><div className="flex justify-center gap-2"><button onClick={() => fetchBalance(acc)} className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="Balance"><Wallet className="w-4 h-4" /></button><button onClick={() => { setEditingAccount(acc); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(acc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td></tr>)) : <tr><td colSpan="6" className="py-12 text-center text-gray-500">No accounts</td></tr>}</tbody></table></div></div>

      {balanceView && (
        <div className="card"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Account Balance: {balanceView.accountName}</h3><button onClick={() => setBalanceView(null)} className="text-sm text-gray-600">Close</button></div><div className="grid grid-cols-4 gap-4"><div className="p-4 bg-blue-50 rounded"><p className="text-sm text-gray-600">Initial Balance</p><p className="text-xl font-bold text-blue-600">{formatCurrency(balanceView.initialBalance)}</p></div><div className="p-4 bg-green-50 rounded"><p className="text-sm text-gray-600">Total Income</p><p className="text-xl font-bold text-green-600">{formatCurrency(balanceView.totalIncome)}</p></div><div className="p-4 bg-red-50 rounded"><p className="text-sm text-gray-600">Total Expense</p><p className="text-xl font-bold text-red-600">{formatCurrency(balanceView.totalExpense)}</p></div><div className="p-4 bg-purple-50 rounded"><p className="text-sm text-gray-600">Current Balance</p><p className="text-xl font-bold text-purple-600">{formatCurrency(balanceView.currentBalance)}</p></div></div></div>
      )}

      {modalOpen && <BankAccountModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingAccount(null); }} account={editingAccount} onSuccess={() => { fetchAccounts(); setModalOpen(false); setEditingAccount(null); }} />}
    </div>
  );
}