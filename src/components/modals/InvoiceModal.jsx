// src/components/modals/InvoiceModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { invoiceAPI, clientAPI } from '../../services/api';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceModal({ isOpen, onClose, invoice, onSuccess }) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        clientId: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        paidAmount: 0,
        status: 'draft',
        paymentStatus: 'pending',
        paymentTerms: 'Net 30',
        notes: ''
    });
    const [invoiceItems, setInvoiceItems] = useState([
        { description: '', quantity: 1, unitPrice: 0, amount: 0 }
    ]);

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            if (invoice) {
                setFormData({
                    invoiceNumber: invoice.invoiceNumber || '',
                    clientId: invoice.clientId || '',
                    invoiceDate: invoice.invoiceDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                    dueDate: invoice.dueDate?.split('T')[0] || '',
                    subtotal: invoice.subtotal || 0,
                    taxRate: invoice.taxRate || 0,
                    taxAmount: invoice.taxAmount || 0,
                    discountAmount: invoice.discountAmount || 0,
                    totalAmount: invoice.totalAmount || 0,
                    paidAmount: invoice.paidAmount || 0,
                    status: invoice.status || 'draft',
                    paymentStatus: invoice.paymentStatus || 'pending',
                    paymentTerms: invoice.paymentTerms || 'Net 30',
                    notes: invoice.notes || ''
                });
                if (invoice.invoiceItems && invoice.invoiceItems.length > 0) {
                    setInvoiceItems(invoice.invoiceItems.map(item => ({
                        description: item.description || '',
                        quantity: item.quantity || 1,
                        unitPrice: item.unitPrice || 0,
                        amount: item.amount || 0
                    })));
                }
            } else {
                // Generate invoice number
                generateInvoiceNumber();
            }
        }
    }, [isOpen, invoice]);

    const fetchClients = async () => {
        try {
            const response = await clientAPI.getAll({ profileId: profile.id, isActive: true, limit: 100 });
            setClients(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const generateInvoiceNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setFormData(prev => ({ ...prev, invoiceNumber: `INV-${year}${month}-${random}` }));
    };

    const addItem = () => {
        setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    };

    const removeItem = (index) => {
        if (invoiceItems.length === 1) {
            toast.error('At least one item is required');
            return;
        }
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...invoiceItems];
        updatedItems[index][field] = value;

        // Calculate amount
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            const unitPrice = parseFloat(updatedItems[index].unitPrice) || 0;
            updatedItems[index].amount = quantity * unitPrice;
        }

        setInvoiceItems(updatedItems);
        calculateTotals(updatedItems, formData.taxRate, formData.discountAmount);
    };

    const calculateTotals = (items = invoiceItems, taxRate = formData.taxRate, discount = formData.discountAmount) => {
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const taxAmount = (subtotal * parseFloat(taxRate)) / 100;
        const totalAmount = subtotal + taxAmount - parseFloat(discount);

        setFormData(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2)
        }));
    };

    const handleTaxChange = (value) => {
        setFormData(prev => ({ ...prev, taxRate: value }));
        calculateTotals(invoiceItems, value, formData.discountAmount);
    };

    const handleDiscountChange = (value) => {
        setFormData(prev => ({ ...prev, discountAmount: value }));
        calculateTotals(invoiceItems, formData.taxRate, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate items
        if (invoiceItems.length === 0 || invoiceItems.every(item => !item.description)) {
            toast.error('At least one item with description is required');
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...formData,
                profileId: profile.id,
                invoiceItems: invoiceItems.filter(item => item.description) // Remove empty items
            };

            if (invoice) {
                await invoiceAPI.update(invoice.id, data);
                toast.success('Invoice updated');
            } else {
                await invoiceAPI.create(data);
                toast.success('Invoice created');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{invoice ? 'Edit' : 'Create'} Invoice</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Invoice Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Invoice Number *</label>
                            <input
                                type="text"
                                required
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                className="input"
                                placeholder="INV-2025-0001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Client *</label>
                            <select
                                required
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="input"
                            >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.companyName || client.contactPerson}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Invoice Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.invoiceDate}
                                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Payment Terms</label>
                            <select
                                value={formData.paymentTerms}
                                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                className="input"
                            >
                                <option value="Net 15">Net 15</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 45">Net 45</option>
                                <option value="Net 60">Net 60</option>
                                <option value="Due on Receipt">Due on Receipt</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="input"
                            >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="viewed">Viewed</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Invoice Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {invoiceItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-start p-3 border rounded-lg bg-gray-50">
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            placeholder="Description *"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            className="input text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            min="0"
                                            step="0.01"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="input text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="Rate"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                            className="input text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={item.amount.toFixed(2)}
                                            readOnly
                                            className="input text-sm bg-gray-100"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            disabled={invoiceItems.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-6">
                        <div className="flex justify-end">
                            <div className="w-96 space-y-3">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-sm text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{profile?.currencySymbol} {formData.subtotal}</span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <label className="text-sm text-gray-600">Tax Rate (%):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.taxRate}
                                        onChange={(e) => handleTaxChange(e.target.value)}
                                        className="input w-24 text-sm"
                                    />
                                </div>

                                {formData.taxAmount > 0 && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-sm text-gray-600">Tax Amount:</span>
                                        <span className="font-medium">{profile?.currencySymbol} {formData.taxAmount}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-2">
                                    <label className="text-sm text-gray-600">Discount:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.discountAmount}
                                        onChange={(e) => handleDiscountChange(e.target.value)}
                                        className="input w-32 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                    <span className="font-semibold text-lg">Total:</span>
                                    <span className="font-bold text-xl">{profile?.currencySymbol} {formData.totalAmount}</span>
                                </div>

                                {invoice && (
                                    <div className="flex justify-between items-center py-2 border-t">
                                        <label className="text-sm text-gray-600">Paid Amount:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.paidAmount}
                                            onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                                            className="input w-32 text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input"
                            rows="3"
                            placeholder="Terms and conditions, payment instructions, etc."
                        ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}