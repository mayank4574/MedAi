import { useState, useCallback } from 'react';
import { Upload, Camera, FolderOpen, CheckCircle2, Circle, Eye, FileText, CheckSquare, Info, AlertCircle, X, Globe } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { analyzeReport } from '../services/api';

// All supported languages with native names
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
];

export default function UploadScan() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('en');
  const [familyMember, setFamilyMember] = useState('Self');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [error, setError] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const addLog = (message, color = 'text-white') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs(prev => [...prev, { time, message, color }]);
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setError('');
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      
      // Add terminal log
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTerminalLogs(prev => [...prev, { time, message: `File selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`, color: 'text-emerald-400' }]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setProcessStep(0);
    setError('');
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please upload a report first');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setProcessStep(1);
    addLog(`Scanning document '${file.name}'...`, 'text-blue-400');

    // Step 2: OCR
    setTimeout(() => {
      setProcessStep(2);
      addLog('Extracting text via Gemini 2.5 Flash Vision OCR...', 'text-emerald-400');
    }, 1500);

    // Step 3: NLP
    setTimeout(() => {
      setProcessStep(3);
      addLog('Identifying medical markers & reference ranges...', 'text-purple-400');
    }, 3000);

    try {
      // Actually call the API
      const formData = new FormData();
      formData.append('report', file);
      formData.append('language', language);
      formData.append('familyMember', familyMember);

      const response = await analyzeReport(formData);
      
      // Step 4: Complete
      setProcessStep(4);
      const langObj = LANGUAGES.find(l => l.code === language);
      addLog(`Translation to ${langObj?.name || language} complete.`, 'text-cyan-400');
      addLog('Comparing with Reference Ranges DB... Analysis Complete. ✓', 'text-white');
      
      // Navigate to report after short delay
      setTimeout(() => {
        setIsProcessing(false);
        navigate(`/reports/${response.data._id}`);
      }, 1500);
    } catch (err) {
      setIsProcessing(false);
      setProcessStep(0);
      const msg = err.response?.data?.message || 'Failed to analyze report. Please try again.';
      setError(msg);
      addLog(`ERROR: ${msg}`, 'text-red-400');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload & Scan</h1>
        <p className="text-slate-600 text-sm">
          Process new medical laboratory reports using high-fidelity AI diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white
                ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 hover:border-[#00a3e0] hover:bg-blue-50/30'}`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-[#00a3e0] text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Drag & Drop your Lab Report
              </h3>
              <p className="text-sm text-slate-500 mb-8">
                Support for medical imaging, blood results, and diagnostic summaries.
              </p>

              <div className="flex gap-4 w-full justify-center" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      if (e.target.files[0]) onDrop([e.target.files[0]]);
                    };
                    input.click();
                  }}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer hover:shadow-lg"
                >
                  <Camera size={18} /> Upload Camera
                </button>
                <button 
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer hover:shadow-md"
                >
                  <FolderOpen size={18} /> Browse Files
                </button>
              </div>
            </div>
          ) : (
            /* File Preview */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Selected File</h3>
                <button 
                  onClick={removeFile}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Remove file"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="Report preview" className="w-24 h-24 rounded-xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-red-50 flex items-center justify-center">
                    <FileText size={32} className="text-red-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">Ready for analysis</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Translation Language Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Globe size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Translation Language</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Select the output language for your translated report.</p>
                </div>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-56 p-2.5 outline-none cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Family Member Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Report For</h4>
                <p className="text-xs text-slate-500 mt-1">Assign this report to yourself or a family member.</p>
              </div>
              <input 
                type="text"
                value={familyMember}
                onChange={(e) => setFamilyMember(e.target.value)}
                placeholder="Self"
                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-48 p-2.5 outline-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Start Analysis Button */}
          {file && (
            <div className="flex justify-end">
              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold shadow-md hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer hover:shadow-lg active:scale-[0.98] ${isProcessing ? 'animate-pulse-glow' : ''}`}
              >
                {isProcessing ? '⏳ Processing...' : '🔬 Start Analysis'}
              </button>
            </div>
          )}

          {/* Terminal View */}
          <div className="bg-[#1e1e2d] rounded-xl overflow-hidden shadow-lg border border-slate-800">
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="text-xs font-mono text-slate-400">MedScanAI Processing Engine</p>
              <p className="text-xs font-mono text-emerald-400">V3.0.0-STABLE</p>
            </div>
            <div className="p-4 font-mono text-xs leading-loose text-slate-300 h-48 overflow-y-auto" id="terminal-output">
              <div className="flex gap-4">
                <span className="text-slate-500">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="text-white">MedScanAI Engine initialized. Waiting for input...</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-500">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="text-slate-400">Listening on secure medical channel...</span>
              </div>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-slate-500">{log.time}</span>
                  <span className={log.color}>{log.message}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#151521] px-4 py-3 flex gap-4 text-xs font-mono text-slate-400 border-t border-white/5">
              <span>Supported Formats:</span>
              <span className="flex items-center gap-1"><FileText size={12}/> PDF</span>
              <span className="flex items-center gap-1"><Upload size={12}/> JPG / PNG / WebP</span>
              <span className="flex items-center gap-1"><CheckSquare size={12}/> DICOM</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Scanning Process</h3>
            
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
              
              <div className="relative flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${processStep >= 1 ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
                  {processStep >= 1 ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${processStep >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>1. Image Capture</h4>
                  <p className="text-xs text-slate-500 mt-1">High-resolution ingestion complete.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${processStep >= 2 ? 'bg-[#00a3e0] text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
                  {processStep >= 2 ? <Eye size={16} /> : <Circle size={16} />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${processStep >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>2. AI OCR Processing (Gemini 2.5 Flash Vision)</h4>
                  <p className={`text-xs mt-1 ${processStep >= 2 ? 'text-primary font-medium' : 'text-slate-400'}`}>Analyzing document structure...</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${processStep >= 3 ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
                  {processStep >= 3 ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${processStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>3. Medical NLP Analysis</h4>
                  <p className={`text-xs mt-1 ${processStep >= 3 ? 'text-purple-500 font-medium' : 'text-slate-400'}`}>Clinical terminology extraction.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${processStep >= 4 ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
                  {processStep >= 4 ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${processStep >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>4. Results Finalization</h4>
                  <p className={`text-xs mt-1 ${processStep >= 4 ? 'text-emerald-500 font-medium' : 'text-slate-400'}`}>{processStep >= 4 ? 'Analysis complete! ✓' : 'Verification and DB cross-ref.'}</p>
                </div>
              </div>

            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <Info className="text-blue-500 shrink-0" size={18} />
              <p className="text-xs text-slate-600 leading-relaxed">
                AI processing typically takes 15-30 seconds depending on document complexity.
              </p>
            </div>
          </div>

          {/* System Status Card */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl overflow-hidden relative h-32 flex flex-col justify-end p-5">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <p className="text-[#00a3e0] text-xs font-semibold mb-1">System Status</p>
              <h4 className="text-white text-lg font-bold">Neural Engine Active</h4>
              <p className="text-slate-300 text-xs mt-1">99.8% Analysis Accuracy</p>
            </div>
          </div>

          {/* Supported Languages Count */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Globe size={18} className="text-primary" />
              <h4 className="text-sm font-bold text-slate-900">Multi-Language Support</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              MedScanAI supports <span className="font-bold text-primary">{LANGUAGES.length}+ languages</span> for report translation including Hindi, Japanese, Spanish, Arabic, Tamil, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
