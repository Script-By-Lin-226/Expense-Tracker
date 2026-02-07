import { useState, useEffect } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import IncomeForm from '../components/IncomeForm';
import IncomeList from '../components/IncomeList';
import { expenseAPI, incomeAPI } from '../services/api';
import * as XLSX from 'xlsx';

const Home = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    month: '',
    year: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const defaultCategories = [
    'Food',
    'Transport',
    'Rent',
    'Shopping',
    'Bills',
    'Entertainment',
    'Health',
    'Other',
  ];

  useEffect(() => {
    fetchData();
  }, [filters, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.month) params.month = parseInt(filters.month);
      if (filters.year) params.year = parseInt(filters.year);
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;

      if (activeTab === 'expenses') {
        const response = await expenseAPI.getAll(params);
        setExpenses(response.data);
      } else {
        const response = await incomeAPI.getAll(params);
        setIncome(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleExportCSV = async () => {
    try {
      const response = activeTab === 'expenses'
        ? await expenseAPI.exportCSV()
        : await incomeAPI.exportCSV();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const data = activeTab === 'expenses' ? expenses : income;
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab);
      XLSX.writeFile(wb, `${activeTab}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expense & Income Tracker</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-gray-800 hover:bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`${
                activeTab === 'expenses'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`${
                activeTab === 'income'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Income
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showFilters ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              )}
            </svg>
          </button>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
          <input
            type="text"
            name="search"
            placeholder="Search..."
            value={filters.search}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
          >
            <option value="">All Categories</option>
            {defaultCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={filters.year}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Start Date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="End Date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Forms and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          {activeTab === 'expenses' ? (
            <ExpenseForm onSuccess={handleRefresh} categories={defaultCategories} />
          ) : (
            <IncomeForm onSuccess={handleRefresh} categories={defaultCategories} />
          )}
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : activeTab === 'expenses' ? (
            <ExpenseList expenses={expenses} onUpdate={handleRefresh} categories={defaultCategories} />
          ) : (
            <IncomeList income={income} onUpdate={handleRefresh} categories={defaultCategories} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
