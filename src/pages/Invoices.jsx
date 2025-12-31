// src/pages/Invoices.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { invoiceAPI, clientAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, FileText, Eye, Send, Download } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import InvoiceModal from '../components/modals/InvoiceModal';

export default function Invoices() {
    const { profile } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [viewInvoice, setViewInvoice] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        clientId: '',
        status: '',
        paymentStatus: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (profile?.id) {
            fetchInvoices();
            fetchStats();
        }
    }, [profile, filters]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getAll({ profileId: profile.id, ...filters });
            setInvoices(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await invoiceAPI.getStats({ profileId: profile.id });
            setStats(response.data.data.summary);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this invoice? This cannot be undone.')) return;
        try {
            await invoiceAPI.delete(id, profile.id);
            toast.success('Invoice deleted');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        setModalOpen(true);
    };

    const handleView = (invoice) => {
        setViewInvoice(invoice);
    };

    const handleSuccess = () => {
        fetchInvoices();
        fetchStats();
        setModalOpen(false);
        setEditingInvoice(null);
    };

    const formatCurrency = (amount) => `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-700',
            sent: 'bg-blue-100 text-blue-700',
            viewed: 'bg-purple-100 text-purple-700',
            paid: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return badges[status] || badges.draft;
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-700',
            partial: 'bg-blue-100 text-blue-700',
            paid: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700'
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-1">Create and manage invoices</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Create Invoice
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Invoices</p>
                        <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalCount || 0}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.totalAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">All invoices</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600 mb-2">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.paidAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">Received</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600 mb-2">Outstanding</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(parseFloat(stats?.totalAmount || 0) - parseFloat(stats?.paidAmount || 0))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pending payment</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="input pl-10"
                        />
                    </div>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="input">
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="viewed">Viewed</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value, page: 1 })} className="input">
                        <option value="">Payment Status</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                    </select>
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                        className="input"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                        className="input"
                        placeholder="End Date"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Invoice #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Due Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="py-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                <span className="font-mono font-medium text-sm">{invoice.invoiceNumber}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900">{invoice.client?.companyName || invoice.client?.contactPerson}</p>
                                            <p className="text-xs text-gray-500">{invoice.client?.email}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <p className="font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                                            {invoice.paidAmount > 0 && (
                                                <p className="text-xs text-green-600">Paid: {formatCurrency(invoice.paidAmount)}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(invoice.paymentStatus)}`}>
                                                {invoice.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(invoice)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(invoice)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-gray-500">
                                        No invoices found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {invoices.length} of {pagination.totalItems} results
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={!pagination.hasPrevPage}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={!pagination.hasNextPage}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Invoice Modal */}
            {viewInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Invoice Details</h2>
                            <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-gray-100 rounded">
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Invoice Header */}
                            <div className="flex justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">INVOICE</h3>
                                    <p className="text-gray-600">#{viewInvoice.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Date: {format(new Date(viewInvoice.invoiceDate), 'MMM dd, yyyy')}</p>
                                    {viewInvoice.dueDate && (
                                        <p className="text-sm text-gray-600">Due: {format(new Date(viewInvoice.dueDate), 'MMM dd, yyyy')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Bill To:</p>
                                <p className="font-semibold text-gray-900">{viewInvoice.client?.companyName || viewInvoice.client?.contactPerson}</p>
                                {viewInvoice.client?.email && <p className="text-sm text-gray-600">{viewInvoice.client.email}</p>}
                                {viewInvoice.client?.phone && <p className="text-sm text-gray-600">{viewInvoice.client.phone}</p>}
                                {viewInvoice.client?.address && <p className="text-sm text-gray-600">{viewInvoice.client.address}</p>}
                            </div>

                            {/* Invoice Items */}
                            <div className="mb-6">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Description</th>
                                            <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">Qty</th>
                                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Rate</th>
                                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewInvoice.invoiceItems?.map((item, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="py-2 px-4 text-sm">{item.description}</td>
                                                <td className="py-2 px-4 text-sm text-center">{item.quantity}</td>
                                                <td className="py-2 px-4 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                                                <td className="py-2 px-4 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end mb-6">
                                <div className="w-64">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-sm text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(viewInvoice.subtotal)}</span>
                                    </div>
                                    {viewInvoice.taxAmount > 0 && (
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-sm text-gray-600">Tax ({viewInvoice.taxRate}%):</span>
                                            <span className="font-medium">{formatCurrency(viewInvoice.taxAmount)}</span>
                                        </div>
                                    )}
                                    {viewInvoice.discountAmount > 0 && (
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-sm text-gray-600">Discount:</span>
                                            <span className="font-medium text-red-600">-{formatCurrency(viewInvoice.discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold text-lg">{formatCurrency(viewInvoice.totalAmount)}</span>
                                    </div>
                                    {viewInvoice.paidAmount > 0 && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-sm text-green-600">Paid:</span>
                                            <span className="font-medium text-green-600">{formatCurrency(viewInvoice.paidAmount)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {viewInvoice.notes && (
                                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                    <p className="text-sm text-gray-600">{viewInvoice.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && (
                <InvoiceModal
                    isOpen={modalOpen}
                    onClose={() => { setModalOpen(false); setEditingInvoice(null); }}
                    invoice={editingInvoice}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}