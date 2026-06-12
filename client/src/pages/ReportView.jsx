import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Share2, Download, ClipboardList, Info, ChevronRight, Stethoscope, Clock, ShieldCheck, Activity, ArrowLeft, Trash2, Loader2, AlertTriangle, Search, CheckCircle } from 'lucide-react';
import { getReport, deleteReport } from '../services/api';
import ParameterTooltip from '../components/ParameterTooltip';
import { generateReportPDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useModal } from '../context/ModalContext';

const VIEW_TRANSLATIONS = {
  en: {
    reports: 'Reports',
    analysis: 'Analysis',
    report: 'Report',
    totalMetrics: 'Total Metrics',
    normal: 'Normal',
    attentionNeeded: 'Attention Needed',
    panel: 'Panel',
    tests: 'Tests',
    metricName: 'Metric Name',
    yourValue: 'Your Value',
    referenceRange: 'Reference Range',
    status: 'Status',
    back: 'Back',
    delete: 'Delete',
    pdfDownload: 'PDF Download',
    generating: 'Generating...',
    clinicalGuidance: 'Clinical Guidance',
    keyFindings: 'Key Findings',
    parameter: 'Parameter',
    value: 'Value',
    range: 'Range',
    severity: 'Severity',
    possibleHealthConcerns: 'Possible Health Concerns',
    recommendedNextSteps: 'Recommended Next Steps',
    recommendedSpecialist: 'Recommended Specialist',
    findNearbyDoctors: 'Find Nearby Doctors',
    disclaimer: 'This interpretation is for educational purposes only and is not a medical diagnosis, prescription, or treatment plan. Please consult a qualified healthcare professional for medical advice.',
    aiInsights: 'AI Insights',
    summaryAnalysis: 'Summary Analysis',
    flaggedValues: 'Flagged Values',
    scheduleConsultation: 'Schedule GP Consultation',
    discussFlagged: 'Discuss your flagged values with your doctor.',
    retest3Months: 'Retest in 3 months',
    monitorProgress: 'Monitor progress on flagged values after lifestyle changes.',
    reviewDiet: 'Review Dietary Guidelines',
    accessCurated: "Access MedScanAI's curated health recommendations.",
    viewTrends: 'View Health Trends',
    certifiedAnalysis: 'MedScanAI Certified Analysis',
    languageLabel: 'Language',
    lab: 'Lab',
    date: 'Date',
    for: 'For',
    overallStatusLabels: {
      normal: 'NORMAL',
      attention: 'ATTENTION',
      urgent: 'URGENT'
    },
    statusLabels: {
      normal: 'Normal',
      borderline: 'Borderline',
      critical: 'High'
    }
  },
  ja: {
    reports: 'レポート',
    analysis: '分析結果',
    report: 'レポート',
    totalMetrics: '検査項目数',
    normal: '正常項目',
    attentionNeeded: '要注意項目',
    panel: 'パネル',
    tests: '項目',
    metricName: '項目名',
    yourValue: '測定値',
    referenceRange: '基準値',
    status: '状態',
    back: '戻る',
    delete: '削除',
    pdfDownload: 'PDFダウンロード',
    generating: '生成中...',
    clinicalGuidance: '臨床的ガイダンス',
    keyFindings: '主な所見',
    parameter: '項目名',
    value: '測定値',
    range: '基準値',
    severity: '緊急度',
    possibleHealthConcerns: '考えられる健康上の懸念事項',
    recommendedNextSteps: '推奨される次のステップ',
    recommendedSpecialist: '推奨される専門医',
    findNearbyDoctors: '近くの医師を探す',
    disclaimer: 'この解釈は教育的な目的のみを対象としており、医師の診断、処方、または治療計画に代わるものではありません。医療的なアドバイスについては、必ず資格を持つ医療専門家にご相談ください。',
    aiInsights: 'AIインサイト',
    summaryAnalysis: '要約分析',
    flaggedValues: '要注意の測定値',
    scheduleConsultation: '一般内科医への相談',
    discussFlagged: '指摘された測定値について医師にご相談ください。',
    retest3Months: '3ヶ月後の再検査',
    monitorProgress: '生活習慣の改善後、数値の経過を観察します。',
    reviewDiet: '食事ガイドラインの確認',
    accessCurated: 'MedScanAIが推奨する健康習慣を確認します。',
    viewTrends: '健康トレンドを表示',
    certifiedAnalysis: 'MedScanAI 認定分析',
    languageLabel: '言語',
    lab: '検査機関',
    date: '検査日',
    for: '対象者',
    overallStatusLabels: {
      normal: '正常',
      attention: '要注意',
      urgent: '至急受診'
    },
    statusLabels: {
      normal: '正常',
      borderline: '境界値',
      critical: '高い'
    }
  },
  hi: {
    reports: 'रिपोर्ट्स',
    analysis: 'विश्लेषण',
    report: 'रिपोर्ट',
    totalMetrics: 'कुल पैरामीटर',
    normal: 'सामान्य',
    attentionNeeded: 'ध्यान देने की आवश्यकता',
    panel: 'पैनल',
    tests: 'परीक्षण',
    metricName: 'पैरामीटर नाम',
    yourValue: 'आपका मान',
    referenceRange: 'सामान्य सीमा',
    status: 'स्थिति',
    back: 'पीछे',
    delete: 'हटाएं',
    pdfDownload: 'PDF डाउनलोड',
    generating: 'तैयार हो रहा है...',
    clinicalGuidance: 'नैदानिक मार्गदर्शन',
    keyFindings: 'मुख्य निष्कर्ष',
    parameter: 'पैरामीटर',
    value: 'मान',
    range: 'सामान्य सीमा',
    severity: 'गंभीरता',
    possibleHealthConcerns: 'संभावित स्वास्थ्य चिंताएं',
    recommendedNextSteps: 'अनुशंसित अगले कदम',
    recommendedSpecialist: 'अनुशंसित विशेषज्ञ',
    findNearbyDoctors: 'आसपास के डॉक्टर खोजें',
    disclaimer: 'यह व्याख्या केवल शैक्षिक उद्देश्यों के लिए है और कोई चिकित्सा निदान, नुस्खा या उपचार योजना नहीं है। कृपया चिकित्सा सलाह के लिए एक योग्य स्वास्थ्य देखभाल पेशेवर से परामर्श लें।',
    aiInsights: 'एआई अंतर्दृष्टि',
    summaryAnalysis: 'सारांश विश्लेषण',
    flaggedValues: 'चिह्नित मान',
    scheduleConsultation: 'सामान्य चिकित्सक से परामर्श लें',
    discussFlagged: 'अपने चिह्नित मानों पर अपने डॉक्टर के साथ चर्चा करें।',
    retest3Months: '3 महीने में दोबारा जांचें',
    monitorProgress: 'जीवनशैली में बदलाव के बाद चिह्नित मानों पर प्रगति की निगरानी करें।',
    reviewDiet: 'आहार दिशानिर्देशों की समीक्षा करें',
    accessCurated: 'MedScanAI की चुनिंदा स्वास्थ्य सिफारिशें देखें।',
    viewTrends: 'स्वास्थ्य रुझान देखें',
    certifiedAnalysis: 'MedScanAI प्रमाणित विश्लेषण',
    languageLabel: 'भाषा',
    lab: 'प्रयोगशाला',
    date: 'तिथि',
    for: 'के लिए',
    overallStatusLabels: {
      normal: 'सामान्य',
      attention: 'ध्यान दें',
      urgent: 'तत्काल'
    },
    statusLabels: {
      normal: 'सामान्य',
      borderline: 'सीमांत',
      critical: 'उच्च'
    }
  },
  gu: {
    reports: 'રિપોર્ટસ',
    analysis: 'વિશ્લેષણ',
    report: 'રિપોર્ટ',
    totalMetrics: 'કુલ માપદંડો',
    normal: 'સામાન્ય',
    attentionNeeded: 'ધ્યાન જરૂરી',
    panel: 'પેનલ',
    tests: 'પરીક્ષણો',
    metricName: 'માપદંડ નામ',
    yourValue: 'તમારું મૂલ્ય',
    referenceRange: 'સામાન્ય સીમા',
    status: 'સ્થિતિ',
    back: 'પાછા',
    delete: 'કાઢી નાખો',
    pdfDownload: 'PDF ડાઉનલોડ',
    generating: 'તૈયાર થઈ રહ્યું છે...',
    clinicalGuidance: 'ક્લિનિકલ માર્ગદર્શન',
    keyFindings: 'મુખ્ય તારણો',
    parameter: 'માપદંડ',
    value: 'મૂલ્ય',
    range: 'સામાન્ય સીમા',
    severity: 'તીવ્રતા',
    possibleHealthConcerns: 'સંભવિત આરોગ્ય ચિંતાઓ',
    recommendedNextSteps: 'ભલામણ કરેલ આગામી પગલાં',
    recommendedSpecialist: 'ભલામણ કરેલ નિષ્ણાત',
    findNearbyDoctors: 'નજીકના ડોકટરો શોધો',
    disclaimer: 'આ અર્થઘટન માત્ર શૈક્ષણિક હેતુઓ માટે જ છે અને તે કોઈ તબીબી નિદાન, પ્રિસ્ક્રિપ્શન કે સારવાર યોજના નથી. તબીબી સલાહ માટે કૃપા કરીને લાયક હેલ્થકેર પ્રોફેશનલની સલાહ લો.',
    aiInsights: 'AI આંતરદૃષ્ટિ',
    summaryAnalysis: 'સારાંશ વિશ્લેષણ',
    flaggedValues: 'ચિહ્નિત મૂલ્યો',
    scheduleConsultation: 'સામાન્ય ચિકિત્સકની સલાહ લો',
    discussFlagged: 'તમારા ચિહ્નિત મૂલ્યોની તમારા ડૉક્ટર સાથે ચર્ચા કરો.',
    retest3Months: '3 મહિનામાં ફરી ટેસ્ટ કરાવો',
    monitorProgress: 'જીવનશૈલીમાં ફેરફાર પછી ચિહ્નિત મૂલ્યો પર પ્રગતિનું નિરીક્ષણ કરો.',
    reviewDiet: 'આહાર માર્ગદર્શિકાની સમીક્ષા કરો',
    accessCurated: 'MedScanAI ના ક્યુરેટેડ આરોગ્ય ભલામણો જુઓ.',
    viewTrends: 'આરોગ્ય વલણો જુઓ',
    certifiedAnalysis: 'MedScanAI પ્રમાણિત વિશ્લેષણ',
    languageLabel: 'ભાષા',
    lab: 'લેબોરેટરી',
    date: 'તારીખ',
    for: 'માટે',
    overallStatusLabels: {
      normal: 'સામાન્ય',
      attention: 'ધ્યાન આપો',
      urgent: 'તાત્કાલિક'
    },
    statusLabels: {
      normal: 'સામાન્ય',
      borderline: 'બોર્ડરલાઇન',
      critical: 'ઊંચું'
    }
  },
  fr: {
    reports: 'Rapports',
    analysis: 'Analyse',
    report: 'Rapport',
    totalMetrics: 'Total des mesures',
    normal: 'Normal',
    attentionNeeded: 'Attention requise',
    panel: 'Panel',
    tests: 'Tests',
    metricName: 'Nom de la mesure',
    yourValue: 'Votre valeur',
    referenceRange: 'Intervalle de réf.',
    status: 'Statut',
    back: 'Retour',
    delete: 'Supprimer',
    pdfDownload: 'Télécharger PDF',
    generating: 'Génération...',
    clinicalGuidance: 'Directives cliniques',
    keyFindings: 'Principaux résultats',
    parameter: 'Paramètre',
    value: 'Valeur',
    range: 'Intervalle',
    severity: 'Gravité',
    possibleHealthConcerns: 'Problèmes de santé potentiels',
    recommendedNextSteps: 'Prochaines étapes recommandées',
    recommendedSpecialist: 'Spécialiste recommandé',
    findNearbyDoctors: 'Trouver des médecins proches',
    disclaimer: 'Cette interprétation est uniquement à but éducatif et ne constitue pas un diagnostic médical, une ordonnance ou un plan de traitement. Veuillez consulter un professionnel de la santé qualifié.',
    aiInsights: 'Analyses IA',
    summaryAnalysis: 'Résumé de l\'analyse',
    flaggedValues: 'Valeurs signalées',
    scheduleConsultation: 'Planifier une consultation médicale',
    discussFlagged: 'Discutez de vos valeurs signalées avec votre médecin.',
    retest3Months: 'Retester dans 3 mois',
    monitorProgress: 'Surveillez l\'évolution de vos valeurs signalées après changements d\'hygiène de vie.',
    reviewDiet: 'Revoir les directives diététiques',
    accessCurated: 'Accédez aux recommandations de santé personnalisées de MedScanAI.',
    viewTrends: 'Voir les tendances de santé',
    certifiedAnalysis: 'Analyse certifiée MedScanAI',
    languageLabel: 'Langue',
    lab: 'Labo',
    date: 'Date',
    for: 'Pour',
    overallStatusLabels: {
      normal: 'NORMAL',
      attention: 'ATTENTION',
      urgent: 'URGENT'
    },
    statusLabels: {
      normal: 'Normal',
      borderline: 'Limite',
      critical: 'Élevé'
    }
  }
};

const getStatusColor = (status) => {
  if (status === 'critical') return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', border: '#ef4444' };
  if (status === 'borderline') return { bg: 'bg-orange-50', text: 'text-orange-500', dot: 'bg-orange-500', border: '#f97316' };
  return { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', border: '#22c55e' };
};

const getStatusLabel = (status, lang) => {
  const t = VIEW_TRANSLATIONS[lang] || VIEW_TRANSLATIONS.en;
  if (status === 'critical') return t.statusLabels.critical;
  if (status === 'borderline') return t.statusLabels.borderline;
  return t.statusLabels.normal;
};

const getOverallBadge = (status, lang) => {
  const t = VIEW_TRANSLATIONS[lang] || VIEW_TRANSLATIONS.en;
  if (status === 'urgent') return { bg: 'bg-red-100', text: 'text-red-700', label: t.overallStatusLabels.urgent };
  if (status === 'attention') return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t.overallStatusLabels.attention };
  return { bg: 'bg-green-100', text: 'text-green-700', label: t.overallStatusLabels.normal };
};

const getLocalizedReportTitle = (reportType, lang) => {
  const typeMap = {
    en: { blood: 'Blood', thyroid: 'Thyroid', liver: 'Liver', kidney: 'Kidney', lipid: 'Lipid', diabetes: 'Diabetes', cbc: 'CBC', urine: 'Urine', other: 'Medical' },
    ja: { blood: '血液', thyroid: '甲状腺', liver: '肝臓', kidney: '腎臓', lipid: '脂質', diabetes: '糖尿病', cbc: '血算', urine: '尿', other: '医療' },
    hi: { blood: 'रक्त', thyroid: 'थायराइड', liver: 'लिवर', kidney: 'किडनी', lipid: 'लिपिड', diabetes: 'मधुमेह', cbc: 'सीबीसी', urine: 'मूत्र', other: 'चिकित्सा' },
    gu: { blood: 'લોહી', thyroid: 'થાઇરોઇડ', liver: 'લિવર', kidney: 'કિડની', lipid: 'લિપિડ', diabetes: 'ડાયાબિટીસ', cbc: 'CBC', urine: 'પેશાબ', other: 'તબીબી' },
    fr: { blood: 'Sang', thyroid: 'Thyroïde', liver: 'Foie', kidney: 'Rein', lipid: 'Lipide', diabetes: 'Diabète', cbc: 'Hémogramme', urine: 'Urine', other: 'Médical' }
  };
  const tMap = typeMap[lang] || typeMap.en;
  const translatedType = tMap[reportType?.toLowerCase()] || tMap.other;
  const suffixMap = {
    en: 'Report',
    ja: 'レポート',
    hi: 'रिपोर्ट',
    gu: 'રિપોર્ટ',
    fr: 'Rapport'
  };
  const suffix = suffixMap[lang] || suffixMap.en;
  return lang === 'ja' ? `${translatedType}${suffix}` : `${translatedType} ${suffix}`;
};

const getLocalizedPanelTitle = (category, lang) => {
  const panelMap = {
    en: 'Panel',
    ja: 'パネル',
    hi: 'पैनल',
    gu: 'પેનલ',
    fr: 'Panel'
  };
  const suffix = panelMap[lang] || panelMap.en;
  return lang === 'ja' ? `${category}${suffix}` : `${category} ${suffix}`;
};

const getLocalizedTestsCount = (count, lang) => {
  const testsMap = {
    en: 'Tests',
    ja: '項目',
    hi: 'परीक्षण',
    gu: 'પરીક્ષણો',
    fr: 'Tests'
  };
  const label = testsMap[lang] || testsMap.en;
  return `${count} ${label}`;
};

const formatDate = (dateString, lang) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  const localeMap = { en: 'en-US', ja: 'ja-JP', hi: 'hi-IN', gu: 'gu-IN', fr: 'fr-FR' };
  const locale = localeMap[lang] || 'en-US';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function ReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { openConfirm } = useModal();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getReport(id);
        setReport(res.data);
      } catch (err) {
        setError('Report not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id]);

  const handleDelete = () => {
    const reportLang = report?.summaryLanguage || 'en';
    openConfirm({
      contextKey: 'deleteReport',
      variant: 'danger',
      lang: reportLang,
      onConfirm: async () => {
        await deleteReport(id);
        return {
          type: 'success',
          title: reportLang === 'ja' ? '削除完了' :
                 reportLang === 'hi' ? 'सफलतापूर्वक हटाया गया' :
                 reportLang === 'gu' ? 'સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું' :
                 reportLang === 'fr' ? 'Suppression réussie' : 'Report Deleted',
          description: reportLang === 'ja' ? 'レポートは正常に削除されました。' :
                       reportLang === 'hi' ? 'रिपोर्ट को सफलतापूर्वक हटा दिया गया है।' :
                       reportLang === 'gu' ? 'રિપોર્ટ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો છે.' :
                       reportLang === 'fr' ? 'Le rapport a été supprimé avec succès.' : 'The report has been successfully deleted.',
          lang: reportLang,
          onClose: () => {
            navigate('/reports');
          }
        };
      }
    });
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    try {
      setIsGeneratingPdf(true);
      const loadingToast = toast.loading('Generating your PDF report...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await generateReportPDF(report, user);
      
      toast.success('PDF downloaded successfully!', { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Loading report analysis...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">{error || 'Report not found'}</p>
        <Link to="/reports" className="text-primary font-semibold hover:underline cursor-pointer">← Back to Reports</Link>
      </div>
    );
  }

  const lang = report.summaryLanguage || 'en';
  const t = VIEW_TRANSLATIONS[lang] || VIEW_TRANSLATIONS.en;
  
  const badge = getOverallBadge(report.overallStatus, lang);
  const abnormalValues = report.labValues?.filter(v => v.status !== 'normal') || [];
  const normalValues = report.labValues?.filter(v => v.status === 'normal') || [];
  const categories = [...new Set(report.labValues?.map(v => v.category) || [])];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="text-xs font-semibold text-slate-500 mb-4 flex items-center gap-1">
        <Link to="/reports" className="hover:text-primary cursor-pointer">{t.reports}</Link>
        <ChevronRight size={12} />
        <span className="text-slate-900">{t.analysis}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {getLocalizedReportTitle(report.reportType, lang)}
            </h1>
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium">
            {t.lab}: <span className="text-slate-900 font-semibold">{report.labName || 'Unknown'}</span> •
            {t.date}: <span className="text-slate-900 font-semibold">{formatDate(report.reportDate, lang)}</span> •
            {t.for}: <span className="text-slate-900 font-semibold">{report.familyMemberName === 'Self' ? (user?.name || 'Self') : (report.familyMemberName || 'Self')}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> {t.back}
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          >
            <Trash2 size={16} /> {t.delete}
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
          >
            {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isGeneratingPdf ? t.generating : t.pdfDownload}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{report.labValues?.length || 0}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{t.totalMetrics}</p>
            </div>
            <div className="bg-white rounded-xl border border-green-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{normalValues.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{t.normal}</p>
            </div>
            <div className="bg-white rounded-xl border border-red-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-red-500">{abnormalValues.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{t.attentionNeeded}</p>
            </div>
          </div>

          {/* Lab Values Table - Grouped by Category */}
          {categories.map(category => {
            const categoryValues = report.labValues.filter(v => v.category === category);
            return (
              <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-900">{getLocalizedPanelTitle(category, lang)}</h3>
                  <span className="bg-blue-100 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                    {getLocalizedTestsCount(categoryValues.length, lang)}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">{t.metricName}</th>
                        <th className="px-6 py-3 font-semibold">{t.yourValue}</th>
                        <th className="px-6 py-3 font-semibold">{t.referenceRange}</th>
                        <th className="px-6 py-3 font-semibold">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categoryValues.map((row, idx) => {
                        const colors = getStatusColor(row.status);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-slate-900 border-l-4" 
                                style={{ borderLeftColor: colors.border }}>
                              <ParameterTooltip row={row} language={lang}>
                                <span>{row.name}</span>
                              </ParameterTooltip>
                            </td>
                            <td className={`px-6 py-4 font-semibold ${colors.text}`}>
                              {row.value} {row.unit}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{row.referenceMin} - {row.referenceMax} {row.unit}</td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1.5 font-semibold text-xs">
                                <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                                {getStatusLabel(row.status, lang)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Clinical Guidance / Doctor's Recommendation */}
          {report.clinicalGuidance ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope size={24} className="text-primary" /> {t.clinicalGuidance}
                </h3>
                {report.clinicalGuidance.urgencyLevel && (
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                    report.overallStatus === 'urgent' ? 'bg-red-100 text-red-700' :
                    report.overallStatus === 'attention' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {report.clinicalGuidance.urgencyLevel}
                  </span>
                )}
              </div>

              {/* Key Findings */}
              {report.clinicalGuidance.findings && report.clinicalGuidance.findings.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">{t.keyFindings}</h4>
                  <div className="overflow-hidden rounded-lg border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[500px]">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">{t.parameter}</th>
                          <th className="px-4 py-2 font-medium">{t.value}</th>
                          <th className="px-4 py-2 font-medium">{t.range}</th>
                          <th className="px-4 py-2 font-medium">{t.severity}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.clinicalGuidance.findings.map((finding, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-medium text-slate-900">{finding.name}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{finding.value} {finding.unit}</td>
                            <td className="px-4 py-3 text-slate-500">{finding.referenceRange}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold uppercase ${finding.status === 'critical' ? 'text-red-600' : 'text-orange-500'}`}>
                                {getStatusLabel(finding.status, lang)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Health Concerns */}
                {report.clinicalGuidance.concerns && report.clinicalGuidance.concerns.length > 0 && (
                  <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100/50 h-full">
                    <h4 className="text-sm font-bold text-orange-900 flex items-center gap-2 mb-3">
                      <AlertTriangle size={16} className="text-orange-500" /> {t.possibleHealthConcerns}
                    </h4>
                    <ul className="space-y-2">
                      {report.clinicalGuidance.concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {report.clinicalGuidance.nextSteps && report.clinicalGuidance.nextSteps.length > 0 && (
                  <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50 h-full">
                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-blue-500" /> {t.recommendedNextSteps}
                    </h4>
                    <ul className="space-y-2">
                      {report.clinicalGuidance.nextSteps.map((step, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Specialist & Action */}
              {report.clinicalGuidance.specialistType && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.recommendedSpecialist}</p>
                    <p className="text-lg font-bold text-slate-900">{report.clinicalGuidance.specialistType}</p>
                  </div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(report.clinicalGuidance.specialistType)}+near+me`, '_blank')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Search size={16} /> {t.findNearbyDoctors}
                  </button>
                </div>
              )}

              {/* Disclaimer */}
              {report.clinicalGuidance.disclaimer && (
                <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-4 flex items-start gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>{report.clinicalGuidance.disclaimer}</p>
                </div>
              )}
            </div>
          ) : report.doctorRecommendation ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardList size={20} className="text-primary" /> {t.doctorRecommendation}
              </h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="text-sm text-slate-700 leading-relaxed">{report.doctorRecommendation}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="bg-[#1e1e2d] rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-[#00a3e0] font-bold">
                <Activity size={18} /> {t.aiInsights}
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">MedScanAI NLP v4.2</span>
            </div>
            
            <h4 className="text-lg font-bold mb-4">{t.summaryAnalysis}</h4>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>{report.summary}</p>
            </div>

            {/* Abnormal values highlights */}
            {abnormalValues.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.flaggedValues}</p>
                {abnormalValues.map((val, idx) => {
                  const colors = getStatusColor(val.status);
                  return (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-sm">{val.name}</span>
                        <span className={`text-xs font-bold ${val.status === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                          {val.value} {val.unit}
                        </span>
                      </div>
                      {val.explanation && (
                        <p className="text-xs text-slate-400 leading-relaxed">{val.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex items-start gap-2 text-xs text-slate-400 bg-white/5 p-3 rounded-lg border border-white/10">
              <Info size={14} className="shrink-0 mt-0.5" />
              <p>{t.disclaimer}</p>
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t.recommendedNextSteps}</h3>
            
            <div className="space-y-6">
              {abnormalValues.length > 0 && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.scheduleConsultation}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.discussFlagged}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.retest3Months}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.monitorProgress}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.reviewDiet}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.accessCurated}</p>
                </div>
              </div>
            </div>

            <Link 
              to="/trends"
              className="w-full mt-6 border border-primary text-primary hover:bg-blue-50 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {t.viewTrends}
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl overflow-hidden relative h-32 flex flex-col justify-end p-5">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10 flex flex-col justify-end h-full">
              <h4 className="text-white text-sm font-bold">{t.certifiedAnalysis} • {report.aiModel || 'gemini-2.5-flash'}</h4>
              <p className="text-slate-400 text-xs mt-1">{t.languageLabel}: {report.summaryLanguage?.toUpperCase() || 'EN'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
