import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardAPI, expenseAPI, incomeAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const COLORS = [
    '#171717', // Very dark gray
    '#404040', // Dark gray
    '#737373', // Medium gray
    '#a3a3a3', // Light gray
    '#525252', // Darker gray
    '#262626', // Very dark
    '#d4d4d4', // Lighter gray
    '#e5e5e5', // Very light gray
  ];

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsResponse = await dashboardAPI.getStats();
      setStats(statsResponse.data);

      // Fetch expense by category
      const categoryResponse = await expenseAPI.getByCategory({ year: selectedYear });
      setExpenseByCategory(categoryResponse.data);

      // Fetch monthly expenses
      const monthlyResponse = await expenseAPI.getMonthly({ year: selectedYear });
      const formattedMonthly = monthlyResponse.data.map(item => ({
        month: monthNames[item.month - 1],
        amount: item.amount,
      }));
      setMonthlyExpenses(formattedMonthly);

      // Fetch expense trend
      const trendResponse = await dashboardAPI.getExpenseTrend({ year: selectedYear });
      const formattedTrend = trendResponse.data.map(item => ({
        month: monthNames[item.month - 1],
        amount: item.amount,
      }));
      setExpenseTrend(formattedTrend);

      // Fetch income vs expense
      const incomeVsExpenseResponse = await dashboardAPI.getIncomeVsExpense({ year: selectedYear });
      const formattedIncomeVsExpense = incomeVsExpenseResponse.data.map(item => ({
        month: monthNames[item.month - 1],
        income: item.income,
        expense: item.expense,
      }));
      setIncomeVsExpense(formattedIncomeVsExpense);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Balance</p>
              <p className={`text-xl sm:text-2xl font-bold ${stats?.total_balance >= 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                {formatCurrency(stats?.total_balance || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.total_income || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Expense</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.total_expense || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Monthly Expense</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.monthly_expense || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Pie Chart - Expense by Category */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Expense by Category</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#525252"
                  dataKey="amount"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Bar Chart - Monthly Expense */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Monthly Expenses</h2>
          {monthlyExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#525252" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Line Chart - Expense Trend */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Expense Trend</h2>
          {expenseTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expenseTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#525252" strokeWidth={2} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Income vs Expense Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Income vs Expense</h2>
          {incomeVsExpense.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#737373" name="Income" />
                <Bar dataKey="expense" fill="#171717" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Recent Transactions</h2>
        {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_transactions.map((transaction) => (
                  <tr key={`${transaction.type}-${transaction.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent transactions</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
