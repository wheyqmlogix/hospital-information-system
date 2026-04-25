'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getMorbidityStats, getDemographicStats } from '@/lib/analytics-utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DOHAnalytics() {
  const records = useLiveQuery(() => db.patients.toArray());
  const billings = useLiveQuery(() => db.billing.toArray());
  const beds = useLiveQuery(() => db.beds.toArray());

  if (!records || !billings || !beds) return <div className="p-8 text-center text-gray-500">Generating report...</div>;

  const morbidityData = getMorbidityStats(records);
  const { sex, ageGroups } = getDemographicStats(records);
  const revenue = getRevenueStats(billings);
  const occupancy = getOccupancyStats(beds);

  const sexData = [
    { name: 'Male', value: sex.Male },
    { name: 'Female', value: sex.Female }
  ];

  const ageData = [
    { name: 'Pediatric (0-18)', value: ageGroups.Pediatric },
    { name: 'Adult (19-59)', value: ageGroups.Adult },
    { name: 'Senior (60+)', value: ageGroups.Senior }
  ];

  const occupancyData = [
    { name: 'Occupied', value: occupancy.occupied },
    { name: 'Cleaning', value: occupancy.cleaning },
    { name: 'Vacant', value: occupancy.vacant }
  ];

  const OCCUPANCY_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 p-4">
      <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">DOH Annual Hospital Report (Analytics)</h2>
          <p className="text-blue-200 text-sm">Automated Morbidity and Demographic Tracking</p>
        </div>
        <div className="flex gap-8">
          <div className="text-right border-l pl-8 border-blue-800">
            <span className="text-3xl font-black">{occupancy.rate.toFixed(1)}%</span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-300">Bed Occupancy Rate</p>
          </div>
          <div className="text-right border-l pl-8 border-blue-800">
            <span className="text-3xl font-black">₱{(revenue.totalGross / 1000).toFixed(1)}k</span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-300">Total Gross Charges</p>
          </div>
          <div className="text-right border-l pl-8 border-blue-800">
            <span className="text-3xl font-black">{records.length}</span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-300">Total Encounters</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase">PhilHealth Claims</p>
            <p className="text-xl font-black text-green-700">₱{revenue.totalPhilHealth.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Self-Pay (Net Due)</p>
            <p className="text-xl font-black text-blue-700">₱{revenue.totalNet.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-yellow-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Discounts</p>
            <p className="text-xl font-black text-yellow-700">₱{revenue.totalDiscounts.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-purple-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Hosp. Efficiency</p>
            <p className="text-xl font-black text-purple-700">{(revenue.totalNet / (revenue.totalGross || 1) * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Top 10 Leading Causes of Morbidity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Top 10 Leading Causes of Morbidity (ICD-10)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={morbidityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="code" type="category" width={50} />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [value, props.payload.description]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Donuts */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2 text-sm">Real-time Bed Status</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={OCCUPANCY_COLORS[index % OCCUPANCY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" layout="horizontal" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2 text-sm">Patient Age Breakdown</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" layout="horizontal" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border text-xs text-gray-500 space-y-2">
        <p className="font-bold text-gray-700 underline">Technical Note:</p>
        <p>This dashboard pulls directly from the local IndexedDB. It ensures zero manual aggregation for the <b>DOH Annual Hospital Statistical Report (AHSR)</b>.</p>
        <p>ICD-10 codes are grouped by etiology as mandated by the Philippine Field Health Services Information System (FHSIS).</p>
      </div>
    </div>
  );
}
