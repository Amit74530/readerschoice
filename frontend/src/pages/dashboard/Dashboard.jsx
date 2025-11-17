// src/pages/admin/Dashboard.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import { MdOutlineInventory2 } from 'react-icons/md';
import { BiRupee } from 'react-icons/bi';
import { AiOutlineFire } from 'react-icons/ai';
import { MdIncompleteCircle } from 'react-icons/md';
import getBaseUrl from '../../utils/baseURL';

const StatCard = ({ icon, value, label, hint }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex items-start gap-4">
    <div className="flex-shrink-0 rounded-full bg-gray-100 p-3 text-gray-700">
      {icon}
    </div>

    <div className="min-w-0">
      <div className="text-lg sm:text-2xl font-semibold leading-tight truncate">
        {value ?? 0}
      </div>
      <div className="text-xs text-gray-500 mt-1 truncate">{label}</div>
      {hint ? <div className="text-xs text-gray-400 mt-1">{hint}</div> : null}
    </div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${getBaseUrl()}/api/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      setData(resp.data || {});
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loading />;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
          <p className="text-sm text-gray-500">Quick summary of store stats</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRefreshing(true); fetchData(); }}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats grid: 1-column mobile, 2-col sm, 4-col xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<MdOutlineInventory2 className="h-6 w-6" />}
          value={data?.totalBooks ?? 0}
          label="Total books"
          hint="All books in catalog"
        />

        <StatCard
          icon={<BiRupee className="h-6 w-6" />}
          value={data?.totalSales ? `₹${data.totalSales}` : '₹0'}
          label="Total sales"
          hint="All-time revenue"
        />

        <StatCard
          icon={<AiOutlineFire className="h-6 w-6" />}
          value={data?.trendingBooks ?? 0}
          label="Trending (this month)"
          hint="Books with highest interest"
        />

        <StatCard
          icon={<MdIncompleteCircle className="h-6 w-6" />}
          value={data?.totalOrders ?? 0}
          label="Total orders"
          hint="Completed orders"
        />
      </div>
    </section>
  );
};

export default Dashboard;
