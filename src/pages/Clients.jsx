import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, Users, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientModal from '../components/modals/ClientModal';

export default function Clients() {
    const { profile } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [filters, setFilters] = useState({ search: '', clientType: '', isActive: '', page: 1, limit: 10 });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (profile?.id) fetchClients();
    }, [profile, filters]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await clientAPI.getAll({ profileId: profile.id, ...filters });
            console.log("response::", response);
            setClients(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete client?')) return;
        try {
            await clientAPI.delete(id, profile.id);
            toast.success('Deleted');
            fetchClients();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Clients</h1><p className="text-gray-600 mt-1">Manage your clients</p></div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Client</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Total Clients</p><p className="text-2xl font-bold">{clients.length}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Active</p><p className="text-2xl font-bold text-green-600">{clients.filter(c => c.isActive).length}</p></div>
                <div className="stat-card"><p className="text-sm text-gray-600 mb-2">Companies</p><p className="text-2xl font-bold text-blue-600">{clients.filter(c => c.clientType === 'company').length}</p></div>
            </div>

            <div className="card"><div className="grid grid-cols-3 gap-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="input pl-10" /></div><select value={filters.clientType} onChange={(e) => setFilters({ ...filters, clientType: e.target.value, page: 1 })} className="input"><option value="">All Types</option><option value="individual">Individual</option><option value="company">Company</option></select><select value={filters.isActive} onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })} className="input"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select></div></div>

            <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr> : clients.length > 0 ? clients.map((client) => (<tr key={client.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4"><div className="flex items-center gap-3"><Users className="w-5 h-5 text-blue-600" /><div><p className="font-medium">{client.companyName || client.contactPerson}</p><p className="text-xs text-gray-500">{client.contactPerson}</p></div></div></td><td className="py-3 px-4"><div className="text-sm"><div className="flex items-center gap-1 text-gray-600"><Mail className="w-3 h-3" />{client.email}</div><div className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" />{client.phone}</div></div></td><td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{client.clientType}</span></td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${client.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{client.isActive ? 'Active' : 'Inactive'}</span></td><td className="py-3 px-4"><div className="flex justify-center gap-2"><button onClick={() => { setEditingClient(client); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td></tr>)) : <tr><td colSpan="5" className="py-12 text-center text-gray-500">No clients</td></tr>}</tbody></table></div></div>

            {modalOpen && <ClientModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingClient(null); }} client={editingClient} onSuccess={() => { fetchClients(); setModalOpen(false); setEditingClient(null); }} />}
        </div>
    );
}