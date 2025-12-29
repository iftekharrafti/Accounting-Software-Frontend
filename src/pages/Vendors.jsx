import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, UserSquare2 } from 'lucide-react';
import toast from 'react-hot-toast';
import VendorModal from '../components/modals/VendorModal';

export default function Vendors() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [filters, setFilters] = useState({ search: '', vendorType: '', isActive: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (profile?.id) fetchVendors();
  }, [profile, filters]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getAll({ profileId: profile.id, ...filters });
      setVendors(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete vendor?')) return;
    try {
      await vendorAPI.delete(id, profile.id);
      toast.success('Deleted');
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Vendors</h1><p className="text-gray-600 mt-1">Manage your vendors</p></div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Vendor</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Vendors</p><p className="text-2xl font-bold">{vendors.length}</p></div>
        <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Active</p><p className="text-2xl font-bold text-green-600">{vendors.filter(v => v.isActive).length}</p></div>
        <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Companies</p><p className="text-2xl font-bold text-blue-600">{vendors.filter(v => v.vendorType === 'company').length}</p></div>
      </div>

      <div className="card"><div className="grid grid-cols-3 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})} className="input pl-10" /></div><select value={filters.vendorType} onChange={(e) => setFilters({...filters, vendorType: e.target.value, page: 1})} className="input"><option value="">All Types</option><option value="individual">Individual</option><option value="company">Company</option></select><select value={filters.isActive} onChange={(e) => setFilters({...filters, isActive: e.target.value, page: 1})} className="input"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select></div></div>

      <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vendor</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr> : vendors.length > 0 ? vendors.map((vendor) => (<tr key={vendor.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4"><div className="flex items-center gap-3"><UserSquare2 className="w-5 h-5 text-purple-600" /><div><p className="font-medium">{vendor.companyName || vendor.contactPerson}</p><p className="text-xs text-gray-500">{vendor.contactPerson}</p></div></div></td><td className="py-3 px-4 text-sm"><div>{vendor.email}</div><div className="text-gray-500">{vendor.phone}</div></td><td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">{vendor.vendorType}</span></td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${vendor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{vendor.isActive ? 'Active' : 'Inactive'}</span></td><td className="py-3 px-4"><div className="flex justify-center gap-2"><button onClick={() => { setEditingVendor(vendor); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(vendor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td></tr>)) : <tr><td colSpan="5" className="py-12 text-center text-gray-500">No vendors</td></tr>}</tbody></table></div></div>

      {modalOpen && <VendorModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingVendor(null); }} vendor={editingVendor} onSuccess={() => { fetchVendors(); setModalOpen(false); setEditingVendor(null); }} />}
    </div>
  );
}