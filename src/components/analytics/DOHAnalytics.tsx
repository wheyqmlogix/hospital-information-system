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

  if (!records) return <div className="p-8 text-center text-gray-500">Generating report...</div>;

  const morbidityData = getMorbidityStats(records);
  const { sex, ageGroups } = getDemographicStats(records);

  const sexData = [
    { name: 'Male', value: sex.Male },
    { name: 'Female', value: sex.Female }
  ];

  const ageData = [
    { name: 'Pediatric (0-18)', value: ageGroups.Pediatric },
    { name: 'Adult (19-59)', value: ageGroups.Adult },
    { name: 'Senior (60+)', value: ageGroups.Senior }
  ];

  return (
    <div className="space-y-8 p-4">
      <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">DOH Annual Hospital Report (Analytics)</h2>
          <p className="text-blue-200 text-sm">Automated Morbidity and Demographic Tracking</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black">{records.length}</span>
          <p className="text-[10px] uppercase font-bold tracking-widest text-blue-300">Total Patient Encounters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Leading Causes of Morbidity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
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
          <div className="text-[10px] text-gray-400 italic text-center">
            Hover over bars to see full diagnosis descriptions.
          </div>
        </div>

        {/* Demographic Breakdown */}
        <div className="grid grid-cols-1 gap-8">
          {/* Sex Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">Patient Sex Distribution</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sexData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sexData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="middle" align="right" layout="vertical" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">Age Groups (Pediatric, Adult, Senior)</h3>
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
                  <Legend verticalAlign="middle" align="right" layout="vertical" />
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
