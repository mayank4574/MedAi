import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Leaf, Pill, Zap, Target, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import { getReports } from '../services/api';

// Available metrics to track
const METRICS = [
  { name: 'Total Cholesterol', key: 'cholesterol' },
  { name: 'Glucose / Blood Sugar', key: 'glucose' },
  { name: 'Vitamin D', key: 'vitamin d' },
  { name: 'Hemoglobin', key: 'hemoglobin' },
  { name: 'TSH', key: 'tsh' },
  { name: 'Creatinine', key: 'creatinine' },
  { name: 'HbA1c', key: 'hba1c' },
  { name: 'HDL Cholesterol', key: 'hdl' },
  { name: 'ESR', key: 'esr' },
  { name: 'WBC Count', key: 'wbc' },
];

export default function Trends() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('cholesterol');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getReports();
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Extract trend data for selected metric
  const metricInfo = METRICS.find(m => m.key === selectedMetric);
  const trendData = [...reports].reverse()
    .filter(r => r.labValues?.some(v => v.name.toLowerCase().includes(selectedMetric)))
    .map(r => {
      const val = r.labValues.find(v => v.name.toLowerCase().includes(selectedMetric));
      return {
        month: new Date(r.reportDate || r.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: parseFloat(val?.value) || 0,
        status: val?.status,
        refMin: val?.referenceMin,
        refMax: val?.referenceMax,
        unit: val?.unit
      };
    });

  // If no real data, use demo data
  const data = trendData.length > 0 ? trendData : [
    { month: 'Jan', value: 135 },
    { month: 'Feb', value: 130 },
    { month: 'Mar', value: 138 },
    { month: 'Apr', value: 125 },
    { month: 'May', value: 132 },
    { month: 'Jun', value: 114 },
  ];

  const refMin = trendData.length > 0 ? trendData[0]?.refMin : 70;
  const refMax = trendData.length > 0 ? trendData[0]?.refMax : 130;
  const unit = trendData.length > 0 ? trendData[0]?.unit : 'mg/dL';

  // Calculate trend
  const firstVal = data[0]?.value || 0;
  const lastVal = data[data.length - 1]?.value || 0;
  const trendPercent = firstVal > 0 ? Math.round(((lastVal - firstVal) / firstVal) * 100) : 0;
  const trendDirection = trendPercent <= 0 ? 'Decrease' : 'Increase';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e1e2d] text-white p-4 rounded-xl shadow-xl border border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold mb-1">{payload[0].value} <span className="text-sm font-medium text-slate-400">{unit}</span></p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Loading trends...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Trend Analysis</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Long-term visualization of your metabolic and diagnostic markers to identify patterns and predict future health outcomes.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="appearance-none bg-white border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-52 pl-4 pr-10 py-2.5 outline-none shadow-sm cursor-pointer"
            >
              {METRICS.map(m => (
                <option key={m.key} value={m.key}>{m.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer">
            <Calendar size={16} className="text-slate-500" /> All Time
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900">{metricInfo?.name || 'Metric'} Progression</h3>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                Show Reference Range Overlay
                <button 
                  onClick={() => setShowOverlay(!showOverlay)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${showOverlay ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${showOverlay ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-[400px] min-h-[256px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['dataMin - 20', 'dataMax + 20']} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {showOverlay && refMin && refMax && (
                    <ReferenceArea y1={refMin} y2={refMax} fill="#e0f2fe" fillOpacity={0.4} strokeOpacity={0} />
                  )}

                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00a3e0" 
                    strokeWidth={3}
                    dot={{ fill: 'white', stroke: '#00a3e0', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:border-[#00a3e0] transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <Leaf size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Lifestyle Impact</h4>
                <p className="text-[11px] text-slate-500 mt-1">Plant-based diet shift observed</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:border-[#00a3e0] transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary shrink-0">
                <Pill size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Medication Adherence</h4>
                <p className="text-[11px] text-slate-500 mt-1">98% compliance this period</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:border-[#00a3e0] transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Energy Correlations</h4>
                <p className="text-[11px] text-slate-500 mt-1">Linked to increased activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1e1e2d] rounded-xl p-8 text-white shadow-lg h-full border border-slate-800 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400"></div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">TREND SUMMARY</p>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              {Math.abs(trendPercent)}% {trendDirection}
              {trendPercent <= 0 ? <TrendingDown size={24} className="text-emerald-400" /> : <TrendingUp size={24} className="text-red-400" />}
            </h2>
            
            <p className="text-sm text-slate-300 leading-relaxed mb-auto">
              {trendData.length > 0 
                ? `Based on ${trendData.length} data points from your uploaded reports.`
                : `Demo data shown. Upload reports to see your real trends.`}
            </p>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3">
                <Target size={18} /> AI Prediction
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {trendPercent <= 0 
                  ? <>Maintaining current habits will likely lead to another <span className="text-emerald-400 font-bold">2-4% reduction</span> by next quarter.</>
                  : <>Consider lifestyle adjustments. MedScanAI recommends <span className="text-orange-400 font-bold">dietary changes</span> to reverse this trend.</>
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
