import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { profile } = useAuth();
  const [overview, setOverview] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [cashFlow, setCashFlow] = useState({ income: [], expense: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData();
    }
  }, [profile, period]);

  const fetchDashboardData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const params = { profileId: profile.id, period };

      const [overviewRes, breakdownRes, transactionsRes, cashFlowRes] = await Promise.all([
        dashboardAPI.getOverview(params),
        dashboardAPI.getCategoryBreakdown(params),
        dashboardAPI.getRecentTransactions(params),
        dashboardAPI.getCashFlow(params)
      ]);

      setOverview(overviewRes.data.data);
      setCategoryBreakdown(breakdownRes.data.data);
      setRecentTransactions(transactionsRes.data.data);
      setCashFlow(cashFlowRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${profile?.currencySymbol || '৳'} ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const prepareCategoryChartData = () => {
    return categoryBreakdown.slice(0, 6).map(item => ({
      name: item.category?.name || 'Unknown',
      value: parseFloat(item.total || 0),
      count: parseInt(item.count || 0)
    }));
  };

  const prepareCashFlowData = () => {
    const dateMap = new Map();
    
    cashFlow.income?.forEach(item => {
      const date = format(new Date(item.date), 'MMM dd');
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, income: 0, expense: 0 });
      }
      dateMap.get(date).income = parseFloat(item.total || 0);
    });

    cashFlow.expense?.forEach(item => {
      const date = format(new Date(item.date), 'MMM dd');
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, income: 0, expense: 0 });
      }
      dateMap.get(date).expense = parseFloat(item.total || 0);
    });

    return Array.from(dateMap.values());
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-96">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 fade-in">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="this_year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="stat-card group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Income</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview?.summary.totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-2">
            Pending: {formatCurrency(overview?.summary.pendingIncome)}
          </p>
        </div>

        {/* Total Expense */}
        <div className="stat-card group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <ArrowDownRight className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expense</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview?.summary.totalExpense)}</p>
          <p className="text-xs text-gray-500 mt-2">
            Pending: {formatCurrency(overview?.summary.pendingExpense)}
          </p>
        </div>

        {/* Net Profit */}
        <div className="stat-card group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg group-hover:opacity-90 transition-opacity ${
              (overview?.summary.netProfit || 0) >= 0 ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                (overview?.summary.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Net Profit/Loss</h3>
          <p className={`text-2xl font-bold ${
            (overview?.summary.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {formatCurrency(overview?.summary.netProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {period.replace('_', ' ')}
          </p>
        </div>

        {/* Bank Balance */}
        <div className="stat-card group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Bank Balance</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview?.summary.totalBankBalance)}</p>
          <p className="text-xs text-gray-500 mt-2">
            All accounts
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareCashFlowData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareCategoryChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareCategoryChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {format(new Date(transaction.incomeDate || transaction.expenseDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{transaction.title}</p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 truncate">{transaction.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: `${transaction.category?.color}20`, color: transaction.category?.color }}
                      >
                        {transaction.category?.icon} {transaction.category?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No recent transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {(overview?.counts.totalIncomes || 0) + (overview?.counts.totalExpenses || 0)}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">{overview?.counts.pendingApprovals || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.counts.totalInvoices || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}