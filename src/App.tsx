import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Sparkles, 
  Target, 
  GraduationCap, 
  Palette, 
  Copy, 
  RotateCcw, 
  Eye, 
  Moon, 
  Sun, 
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface EnhancementMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  prompt: string;
  description: string;
}

const modes: EnhancementMode[] = [
  {
    id: 'creative',
    name: 'Creative',
    icon: <Sparkles className="w-4 h-4" />,
    gradient: 'from-pink-500 to-violet-500',
    prompt: 'Kamu adalah AI Creative Prompt Engineer. Tugasmu adalah meningkatkan kualitas prompt berikut agar menjadi lebih imajinatif, ekspresif, dan kaya detail sensorik (visual, suara, tekstur, emosi). Gunakan gaya bahasa yang hidup, inspiratif, dan penuh kreativitas, namun tetap mudah dipahami AI. Pastikan prompt siap dipakai langsung tanpa harus diubah lagi. Prompt awal: {user_prompt}. Berikan hasil akhir prompt dalam format final yang singkat, jelas, dan tidak ada penjelasan tambahan.',
    description: 'Lebih imajinatif dan ekspresif; cocok untuk ide/art/gaya bahasa hidup.'
  },
  {
    id: 'precise',
    name: 'Precise',
    icon: <Target className="w-4 h-4" />,
    gradient: 'from-blue-500 to-cyan-500',
    prompt: 'Kamu adalah AI Precision Engineer. Tugasmu adalah meningkatkan kualitas prompt berikut agar lebih fokus, jelas, dan bebas ambiguitas. Hapus bagian yang tidak relevan, tambahkan detail yang penting, dan pastikan instruksi mudah diikuti AI. Gunakan bahasa yang tegas, ringkas, dan langsung ke inti. Prompt awal: {user_prompt}. Berikan hasil akhir prompt dalam format final yang jelas, ringkas, dan tepat sasaran.',
    description: 'Paling ringkas dan tegas; cocok untuk instruksi teknis/step-by-step.'
  },
  {
    id: 'academic',
    name: 'Academic',
    icon: <GraduationCap className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-500',
    prompt: 'Kamu adalah AI Academic Prompt Engineer. Tugasmu adalah meningkatkan kualitas prompt berikut agar sesuai dengan standar akademik atau ilmiah. Gunakan bahasa formal, struktur yang logis, dan tambahkan konteks relevan agar prompt siap dipakai untuk penulisan akademik, riset, atau laporan. Hindari bahasa sehari-hari dan pastikan hasilnya konsisten. Prompt awal: {user_prompt}. Berikan hasil akhir prompt dalam format final dengan gaya akademik yang rapi dan formal.',
    description: 'Bahasa formal dan terstruktur; cocok untuk riset, laporan, dokumen resmi.'
  },
  {
    id: 'image',
    name: 'Image AI',
    icon: <Palette className="w-4 h-4" />,
    gradient: 'from-orange-500 to-red-500',
    prompt: 'Kamu adalah AI Visual Prompt Engineer. Tugasmu adalah mengubah prompt berikut menjadi deskriptif, detail, dan siap dipakai untuk generator gambar AI. Fokus pada elemen visual: gaya seni, suasana, pencahayaan, komposisi, warna, dan detail artistik. Hindari kata abstrak yang tidak bisa divisualisasikan. Buat hasilnya deskriptif tapi ringkas agar mudah dipakai. Prompt awal: {user_prompt}. Berikan hasil akhir prompt dalam format final yang siap dipakai pada AI art generator.',
    description: 'Untuk generator gambar; fokus pada detail visual, gaya, cahaya, komposisi.'
  }
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState(modes[0]);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const handleClear = () => {
    setInputPrompt('');
    setEnhancedPrompt('');
    setError('');
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
    }
  };

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto resize textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [inputPrompt]);

  const enhancePrompt = async () => {
    if (!inputPrompt.trim()) {
      setError('Please enter a prompt to enhance');
      return;
    }

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const enhancementPrompt = selectedMode.prompt.replace('{user_prompt}', inputPrompt.trim());
      
      const result = await model.generateContent(enhancementPrompt);
      const response = await result.response;
      const text = response.text();
      
      setEnhancedPrompt(text);
    } catch (err: any) {
      setError(`Enhancement failed: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const regeneratePrompt = () => {
    if (inputPrompt.trim()) {
      enhancePrompt();
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${selectedMode.gradient} shadow-lg`}>
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${selectedMode.gradient} bg-clip-text text-transparent`}>
            AI Prompt Enhancer
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Transform your prompts with AI-powered enhancement modes
          </p>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`absolute top-8 right-8 p-3 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Input Section */}
          <div className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Input Prompt
            </h2>
            
            {/* Mode Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Enhancement Mode
              </label>
              <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedMode.description}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode)}
                    title={mode.description}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-start gap-2 text-left ${
                      selectedMode.id === mode.id
                        ? `border-transparent bg-gradient-to-r ${mode.gradient} text-white shadow-lg ring-2 ring-white/20`
                        : darkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {mode.icon}
                    <span className="font-medium leading-tight">
                      {mode.name}
                      <span className={`block text-xs mt-0.5 ${selectedMode.id === mode.id ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {mode.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Prompt
                </label>
                <button
                  onClick={handleClear}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all duration-200 ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Clear input"
                >
                  Clear
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => {
                  setInputPrompt(e.target.value);
                  if (textareaRef.current) {
                    const el = textareaRef.current;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
                placeholder="Enter your initial prompt here..."
                className={`w-full min-h-32 p-4 rounded-xl border-2 transition-all duration-200 resize-none overflow-hidden ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Enhance Button */}
            <button
              onClick={enhancePrompt}
              disabled={isLoading || !inputPrompt.trim()}
              className={`w-full p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading || !inputPrompt.trim()
                  ? darkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${selectedMode.gradient} text-white hover:shadow-lg hover:scale-105 active:scale-95`
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Enhance Prompt
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Enhanced Prompt
              </h2>
              
              {enhancedPrompt && (
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(enhancedPrompt)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title="Copy enhanced prompt"
                  >
                    {copyStatus ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={regeneratePrompt}
                    disabled={isLoading}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isLoading
                        ? darkMode
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title="Regenerate"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      showComparison
                        ? `bg-gradient-to-r ${selectedMode.gradient} text-white`
                        : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title="Compare before/after"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Copy Status */}
            {copyStatus && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-green-500 text-sm">{copyStatus}</p>
              </div>
            )}

            {/* Output Display */}
            <div className="space-y-4">
              {!showComparison ? (
                <div className={`p-4 rounded-xl border-2 min-h-32 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  {enhancedPrompt ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{enhancedPrompt}</p>
                  ) : (
                    <p className={`italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Enhanced prompt will appear here...
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Before (Original)
                    </h3>
                    <div className={`p-3 rounded-lg border text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-400'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                      <p className="whitespace-pre-wrap">{inputPrompt || 'No original prompt'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      After (Enhanced)
                    </h3>
                    <div className={`p-3 rounded-lg border text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      <p className="whitespace-pre-wrap">{enhancedPrompt || 'No enhanced prompt yet'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Powered by Google Gemini AI • Built with React & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;