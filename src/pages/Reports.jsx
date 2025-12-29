
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportAPI } from '../services/api';
import { FileText, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Reports() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('profit-loss');
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const generateReport = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const params = { profileId: profile.id, ...dateRange };
            let response;
            if (reportType === 'profit-loss') {
                response = await reportAPI.getProfitLoss(params);
            } else if (reportType === 'cash-flow') {
                response = await reportAPI.getCashFlow(params);
            } else if (reportType === 'tax') {
                response = await reportAPI.getTaxReport(params);
            }
            setReportData(response.data.data);
            toast.success('Report generated');
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-600 mt-1">Generate financial reports</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => setReportType('profit-loss')} className={`stat-card text-left hover:scale-105 transition-transform ${reportType === 'profit-loss' ? 'ring-2 ring-primary-500' : ''}`}><div className="flex items-center gap-3 mb-3"><DollarSign className="w-8 h-8 text-green-600" /><div><p className="font-semibold">Profit & Loss</p><p className="text-xs text-gray-500">Income vs Expenses</p></div></div></button>
                <button onClick={() => setReportType('cash-flow')} className={`stat-card text-left hover:scale-105 transition-transform ${reportType === 'cash-flow' ? 'ring-2 ring-primary-500' : ''}`}><div className="flex items-center gap-3 mb-3"><TrendingUp className="w-8 h-8 text-blue-600" /><div><p className="font-semibold">Cash Flow</p><p className="text-xs text-gray-500">Money movement</p></div></div></button>
                <button onClick={() => setReportType('tax')} className={`stat-card text-left hover:scale-105 transition-transform ${reportType === 'tax' ? 'ring-2 ring-primary-500' : ''}`}><div className="flex items-center gap-3 mb-3"><FileText className="w-8 h-8 text-purple-600" /><div><p className="font-semibold">Tax Report</p><p className="text-xs text-gray-500">Tax summary</p></div></div></button>
            </div>

            <div className="card"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" />Date Range</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-medium mb-2">Start Date</label><input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className="input" /></div><div><label className="block text-sm font-medium mb-2">End Date</label><input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className="input" /></div></div><button onClick={generateReport} disabled={loading} className="btn btn-primary w-full disabled:opacity-50">{loading ? 'Generating...' : 'Generate Report'}</button></div>

            {reportData && (
                <div className="card">
                    {reportType === 'profit-loss' && (
                        <div><h3 className="text-xl font-semibold mb-4">Profit & Loss Statement</h3><p className="text-sm text-gray-600 mb-6">Period: {format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - {format(new Date(dateRange.endDate), 'MMM dd, yyyy')}</p><div className="space-y-6"><div><h4 className="font-semibold text-lg mb-3 text-green-700">Income</h4><div className="space-y-2">{reportData.income?.byCategory?.map((cat, idx) => (<div key={idx} className="flex justify-between py-2 border-b"><span>{cat.category?.name || 'Other'}</span><span className="font-semibold text-green-600">{formatCurrency(cat.total)}</span></div>))}<div className="flex justify-between py-3 font-bold text-lg border-t-2"><span>Total Income</span><span className="text-green-600">{formatCurrency(reportData.income?.total)}</span></div></div></div><div><h4 className="font-semibold text-lg mb-3 text-red-700">Expenses</h4><div className="space-y-2">{reportData.expense?.byCategory?.map((cat, idx) => (<div key={idx} className="flex justify-between py-2 border-b"><span>{cat.category?.name || 'Other'}</span><span className="font-semibold text-red-600">{formatCurrency(cat.total)}</span></div>))}<div className="flex justify-between py-3 font-bold text-lg border-t-2"><span>Total Expenses</span><span className="text-red-600">{formatCurrency(reportData.expense?.total)}</span></div></div></div><div className={`p-6 rounded-lg mt-6 ${parseFloat(reportData.netProfit) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}><div className="flex justify-between items-center"><div><p className="text-sm font-medium text-gray-600">Net Profit/Loss</p><p className={`text-3xl font-bold ${parseFloat(reportData.netProfit) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(reportData.netProfit)}</p></div><div className="text-right"><p className="text-sm font-medium text-gray-600">Profit Margin</p><p className="text-2xl font-semibold">{reportData.profitMargin}%</p></div></div></div></div></div>
                    )}

                    {reportType === 'cash-flow' && (
                        <div><h3 className="text-xl font-semibold mb-4">Cash Flow Statement</h3><p className="text-sm text-gray-600 mb-6">Period: {format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - {format(new Date(dateRange.endDate), 'MMM dd, yyyy')}</p><div className="grid grid-cols-2 gap-6"><div className="p-4 bg-blue-50 rounded"><p className="text-sm text-gray-600 mb-2">Opening Balance</p><p className="text-2xl font-bold text-blue-700">{formatCurrency(reportData.openingBalance)}</p></div><div className="p-4 bg-green-50 rounded"><p className="text-sm text-gray-600 mb-2">Cash Inflow</p><p className="text-2xl font-bold text-green-700">{formatCurrency(reportData.cashInflow)}</p></div><div className="p-4 bg-red-50 rounded"><p className="text-sm text-gray-600 mb-2">Cash Outflow</p><p className="text-2xl font-bold text-red-700">{formatCurrency(reportData.cashOutflow)}</p></div><div className="p-4 bg-purple-50 rounded"><p className="text-sm text-gray-600 mb-2">Net Cash Flow</p><p className="text-2xl font-bold text-purple-700">{formatCurrency(reportData.netCashFlow)}</p></div></div><div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"><p className="text-sm font-medium text-gray-600 mb-2">Closing Balance</p><p className="text-3xl font-bold text-gray-900">{formatCurrency(reportData.closingBalance)}</p></div></div>
                    )}

                    {reportType === 'tax' && (
                        <div><h3 className="text-xl font-semibold mb-4">Tax Report</h3><p className="text-sm text-gray-600 mb-6">Period: {format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - {format(new Date(dateRange.endDate), 'MMM dd, yyyy')}</p><div className="space-y-6"><div className="p-4 border rounded"><h4 className="font-semibold mb-3">Taxable Income</h4><div className="flex justify-between mb-2"><span>Total Amount</span><span className="font-semibold">{formatCurrency(reportData.taxableIncome?.totalAmount)}</span></div><div className="flex justify-between"><span>Total Tax</span><span className="font-semibold text-blue-600">{formatCurrency(reportData.taxableIncome?.totalTax)}</span></div></div><div className="p-4 border rounded"><h4 className="font-semibold mb-3">Deductible Expenses</h4><div className="flex justify-between mb-2"><span>Total Amount</span><span className="font-semibold">{formatCurrency(reportData.deductibleExpenses?.totalAmount)}</span></div><div className="flex justify-between"><span>Total Tax</span><span className="font-semibold text-blue-600">{formatCurrency(reportData.deductibleExpenses?.totalTax)}</span></div></div><div className="p-6 bg-blue-50 rounded-lg"><div className="flex justify-between items-center"><span className="font-semibold text-lg">Net Taxable Amount</span><span className="text-2xl font-bold text-blue-700">{formatCurrency(reportData.netTaxable)}</span></div></div></div></div>
                    )}
                </div>
            )}
        </div>
    );
}