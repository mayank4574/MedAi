import { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, FileText, ChevronRight, Activity, Calendar, Shield, Trash2, Loader2 } from 'lucide-react';
import { getFamilyMembers, deleteFamilyMember } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatar';
import { useModal } from '../context/ModalContext';

export default function Family() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const { openConfirm } = useModal();

  // New member form state
  const [formData, setFormData] = useState({ name: '', relation: '', age: '', gender: 'male' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await getFamilyMembers();
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch family members', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('sahi_token') || JSON.parse(localStorage.getItem('sahi_user') || '{}')?.token;
      let API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://medai-3onq.onrender.com/api' : 'http://localhost:5000/api');
      if (API_URL && !API_URL.endsWith('/api')) {
        if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);
        API_URL += '/api';
      }
      const res = await fetch(`${API_URL}/auth/family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          relation: formData.relation,
          age: parseInt(formData.age, 10),
          gender: formData.gender
        })
      });

      if (res.ok) {
        const updatedMembers = await res.json();
        setMembers(updatedMembers);
        setIsAdding(false);
        setFormData({ name: '', relation: '', age: '', gender: 'male' });
      }
    } catch (err) {
      console.error('Failed to add member', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = (member, e) => {
    e.preventDefault();
    e.stopPropagation();
    const userLang = user?.language || 'en';
    
    openConfirm({
      contextKey: 'deleteMember',
      variant: 'danger',
      lang: userLang,
      onConfirm: async () => {
        const res = await deleteFamilyMember(member._id);
        setMembers(res.data);
        return {
          type: 'success',
          title: userLang === 'ja' ? '削除完了' :
                 userLang === 'hi' ? 'सफलतापूर्वक हटाया गया' :
                 userLang === 'gu' ? 'સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું' :
                 userLang === 'fr' ? 'Suppression réussie' : 'Member Deleted',
          description: userLang === 'ja' ? 'メンバーは正常に削除されました。' :
                       userLang === 'hi' ? 'सदस्य को सफलतापूर्वक हटा दिया गया है।' :
                       userLang === 'gu' ? 'સભ્ય સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો છે.' :
                       userLang === 'fr' ? 'Le membre a été supprimé avec succès.' : 'Family member has been successfully deleted.',
          lang: userLang,
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Loading Family Profiles...</p>
      </div>
    );
  }

  // Self is always the first virtual member for UI purposes
  const allProfiles = [
    { name: 'Self', relation: 'Self', age: '-', gender: '-', isSelf: true, alias: user?.name, avatar: user?.avatar },
    ...members
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Family Profiles</h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            Manage your family's health records in one place. Add members to track their reports and AI insights independently.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95 cursor-pointer"
        >
          {isAdding ? <Users size={18} /> : <UserPlus size={18} />}
          {isAdding ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Plus className="text-primary" /> Add New Family Member
          </h3>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary p-3 outline-none transition-all"
                placeholder="e.g., Aarti Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Relation</label>
              <select 
                required
                value={formData.relation}
                onChange={e => setFormData({...formData, relation: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary p-3 outline-none transition-all cursor-pointer"
              >
                <option value="">Select relation...</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
              <input 
                type="number" 
                required
                min="0"
                max="120"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary p-3 outline-none transition-all"
                placeholder="e.g., 45"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary p-3 outline-none transition-all cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProfiles.map((member, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="h-24 bg-gradient-to-r from-[#0f172a] to-[#1e293b] relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="flex justify-between items-end -mt-10 mb-4">
                <img 
                  src={getAvatarUrl({ name: member.alias || member.name, avatar: member.avatar })} 
                  alt={member.name}
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.alias || member.name) + "&background=random&size=128"; }}
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm object-cover bg-white"
                />
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                    {member.relation}
                  </span>
                  {!member.isSelf && (
                    <button 
                      onClick={(e) => handleDeleteMember(member, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100 absolute top-4 right-4"
                      title="Delete Member"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">{member.isSelf ? member.alias : member.name}</h3>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1"><Calendar size={14}/> {member.age} Yrs</span>
                <span className="flex items-center gap-1"><Shield size={14}/> {member.gender?.charAt(0).toUpperCase() + member.gender?.slice(1)}</span>
              </div>

              <div className="mt-6 space-y-3">
                <Link 
                  to="/reports"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 text-slate-700 hover:text-primary transition-colors border border-slate-100 font-semibold text-sm group/btn cursor-pointer"
                >
                  <span className="flex items-center gap-2"><FileText size={16}/> View Reports</span>
                  <ChevronRight size={16} className="text-slate-400 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/trends"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 text-slate-700 hover:text-primary transition-colors border border-slate-100 font-semibold text-sm group/btn cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Activity size={16}/> Health Trends</span>
                  <ChevronRight size={16} className="text-slate-400 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
