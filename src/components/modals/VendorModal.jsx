import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorModal({ isOpen, onClose, vendor, onSuccess }) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        vendorType: 'individual',
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        isActive: true,
        notes: ''
    });

    useEffect(() => {
        if (isOpen && vendor) {
            setFormData({
                vendorType: vendor.vendorType || 'individual',
                companyName: vendor.companyName || '',
                contactPerson: vendor.contactPerson || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                address: vendor.address || '',
                city: vendor.city || '',
                country: vendor.country || '',
                taxId: vendor.taxId || '',
                isActive: vendor.isActive !== undefined ? vendor.isActive : true,
                notes: vendor.notes || ''
            });
        }
    }, [isOpen, vendor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...formData, profileId: profile.id };
            if (vendor) {
                await vendorAPI.update(vendor.id, data);
                toast.success('Updated');
            } else {
                await vendorAPI.create(data);
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
                    <h2 className="text-xl font-semibold">{vendor ? 'Edit' : 'Add'} Vendor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-2">Vendor Type</label><select value={formData.vendorType} onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })} className="input"><option value="individual">Individual</option><option value="company">Company</option></select></div>
                        <div><label className="block text-sm font-medium mb-2">Company Name *</label><input type="text" required value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Contact Person</label><input type="text" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Tax ID</label><input type="text" value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} className="input" /></div>
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">City</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm font-medium mb-2">Country</label><input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input" /></div>
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input" rows="2"></textarea></div>
                        <div className="col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Active</span></label></div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 btn btn-primary disabled:opacity-50">{loading ? 'Saving...' : vendor ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
