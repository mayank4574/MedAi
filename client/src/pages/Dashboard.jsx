import { useState, useEffect } from 'react';
import { FileUp, Info, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight, Users, TrendingDown, TrendingUp, Loader2, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getReports, getFamilyMembers } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, familyRes] = await Promise.all([
          getReports(),
          getFamilyMembers()
        ]);
        setReports(reportsRes.data);
        setFamily(familyRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  // Calculate System Health
  const abnormalReports = reports.filter(r => r.overallStatus === 'attention' || r.overallStatus === 'urgent');
  const healthScore = reports.length > 0 
    ? Math.round(((reports.length - abnormalReports.length) / reports.length) * 100)
    : 100;
  
  const pieData = [{ name: 'Health', value: healthScore }, { name: 'Remaining', value: 100 - healthScore }];
  const pieColors = ['var(--primary)', '#e2e8f0'];

  // Recent Scans
  const recentScans = reports.slice(0, 3);

  // Active Alerts
  const activeAlerts = abnormalReports.slice(0, 2);

  // Extract glucose trend from reports (if available) or use fallback
  const glucoseReports = [...reports].reverse().filter(r => r.labValues?.some(v => v.name.toLowerCase().includes('glucose') || v.name.toLowerCase().includes('sugar')));
  const barData = glucoseReports.length > 0 
    ? glucoseReports.slice(-7).map((r, i) => {
        const val = r.labValues.find(v => v.name.toLowerCase().includes('glucose') || v.name.toLowerCase().includes('sugar'));
        const numVal = parseFloat(val?.value) || 0;
        return { day: new Date(r.reportDate || r.createdAt).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(), value: numVal };
      })
    : [
      { day: 'MON', value: 85 }, { day: 'TUE', value: 92 }, { day: 'WED', value: 88 },
      { day: 'THU', value: 95 }, { day: 'FRI', value: 89 }, { day: 'SAT', value: 105 }, { day: 'SUN', value: 102 }
    ];

  const latestGlucose = barData[barData.length - 1]?.value || 102;

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Family members list
  const familyList = [
    { name: 'Self', relation: 'Self', alias: user?.name, img: `https://ui-avatars.com/api/?name=${user?.name}&background=random` }, 
    ...family.map(f => ({ ...f, img: `https://ui-avatars.com/api/?name=${f.name}&background=random` }))
  ];

  const getFamilyStatus = (memberName) => {
    const memberReports = reports.filter(r => r.familyMemberName === memberName || (memberName === 'Self' && (!r.familyMemberName || r.familyMemberName === 'Self')));
    if (memberReports.length === 0) return { status: 'No Data', color: 'gray', date: 'Never' };
    const latest = memberReports[0];
    const color = latest.overallStatus === 'normal' ? 'green' : (latest.overallStatus === 'attention' ? 'yellow' : 'red');
    return { 
      status: latest.overallStatus?.charAt(0).toUpperCase() + latest.overallStatus?.slice(1) || 'Unknown', 
      color, 
      date: new Date(latest.reportDate || latest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    };
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{greeting}, {user?.name || 'User'}</h1>
          <p className="text-slate-600 max-w-2xl text-sm">
            {reports.length > 0 
              ? `You have ${reports.length} reports in your history. MedScanAI has analyzed them for actionable insights.`
              : `Welcome to MedScanAI. Upload your first lab report to get started.`}
          </p>
        </div>
        <Link to="/upload" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer hover:shadow-lg">
          <FileUp size={16} />
          Start New Scan
        </Link>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* System Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center shadow-sm">
          <div className="w-full flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Overall Health Score</h3>
            <Info size={18} className="text-blue-500 cursor-pointer" />
          </div>
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{healthScore}%</span>
              <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider text-center px-1 sm:px-2">
                {healthScore > 80 ? 'Optimal' : (healthScore > 50 ? 'Needs Attention' : 'Critical')}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center px-4 leading-relaxed">
            Based on {reports.length} recent reports across all profiles.
          </p>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-xl border-t-4 border-t-[#00a3e0] border-x border-b border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Scans</h3>
            <Link to="/reports" className="text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer">View All</Link>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {recentScans.length === 0 ? (
              <div className="text-center text-sm text-slate-500 mt-10">
                <p>No recent scans found.</p>
                <Link to="/upload" className="text-primary font-semibold text-xs mt-2 inline-block cursor-pointer">Upload your first report →</Link>
              </div>
            ) : recentScans.map(scan => (
              <Link key={scan._id} to={`/reports/${scan._id}`} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${scan.overallStatus === 'normal' ? 'bg-blue-100 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                  <FileUp size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{scan.reportType?.charAt(0).toUpperCase() + scan.reportType?.slice(1) || 'Lab Report'}</p>
                  <p className="text-xs text-slate-500">{new Date(scan.reportDate || scan.createdAt).toLocaleDateString()} • {scan.familyMemberName || 'Self'}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${scan.overallStatus === 'normal' ? 'bg-green-100 text-green-700' : scan.overallStatus === 'attention' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                  {scan.overallStatus?.charAt(0).toUpperCase() + scan.overallStatus?.slice(1) || 'Unknown'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-xl border-l-4 border-l-red-500 border-y border-r border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Active Alerts</h3>
            {activeAlerts.length > 0 && <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>}
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="text-center mt-10">
                <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No active alerts. You are healthy!</p>
              </div>
            ) : activeAlerts.map((alert, idx) => (
              <Link key={idx} to={`/reports/${alert._id}`} className={`block border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${alert.overallStatus === 'urgent' ? 'border-red-100 bg-red-50/50 hover:bg-red-50' : 'border-yellow-100 bg-yellow-50/50 hover:bg-yellow-50'}`}>
                <div className="flex gap-3">
                  <AlertTriangle className={`${alert.overallStatus === 'urgent' ? 'text-red-500' : 'text-yellow-600'} shrink-0`} size={18} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{alert.reportType?.charAt(0).toUpperCase() + alert.reportType?.slice(1)} Alert</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {alert.summary || `${alert.labValues?.filter(v => v.status !== 'normal').length || 0} abnormal values detected.`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Family Overview</h2>
            <Link to="/family" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer">
              <Users size={16} /> Manage Group
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {familyList.slice(0, 3).map((member, idx) => {
              const info = getFamilyStatus(member.name);
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start gap-3 mb-6">
                    <img src={member.img} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs font-medium text-slate-500">({member.relation || member.alias || 'Family'})</p>
                      <p className="text-[10px] text-slate-400 mt-1">Last Scan: {info.date}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <div className={`flex items-center gap-1 text-xs font-semibold ${info.color === 'green' ? 'text-green-600' : (info.color === 'red' ? 'text-red-500' : info.color === 'yellow' ? 'text-yellow-600' : 'text-slate-500')}`}>
                      {info.color === 'green' ? <CheckCircle2 size={14} /> : (info.color !== 'gray' ? <AlertCircle size={14} /> : <Info size={14} />)}
                      {info.status}
                    </div>
                    <Link to="/reports" className="text-xs font-medium text-primary hover:underline cursor-pointer">Details</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Glucose Trends</h2>
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm min-h-[204px] h-auto flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LATEST VALUE</p>
                <p className="text-2xl font-bold text-slate-900">{latestGlucose} <span className="text-sm font-medium text-slate-500">mg/dL</span></p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 shrink-0 ${latestGlucose > 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {latestGlucose > 100 ? <><TrendingUp size={12} /> High</> : <><TrendingDown size={12} /> Normal</>}
              </span>
            </div>
            <div className="h-32 sm:h-24 min-h-[96px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} dy={10} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === barData.length - 1 ? 'var(--primary)' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
