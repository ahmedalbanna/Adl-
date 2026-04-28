import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scale, MessageSquare, ShieldCheck, User, Gavel, LayoutDashboard, PlusCircle, ArrowRight, ArrowLeft, X, BrainCircuit, Calendar, FileText, LogIn } from "lucide-react";
import CaseSubmissionView from "./domains/cases/components/CaseSubmissionView";
import { CasesService } from "./domains/cases/CasesService";
import { auth } from "./lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

type View = 'landing' | 'submit' | 'dashboard';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleSignOut = () => signOut(auth);

  const [myCases, setMyCases] = useState<any[]>([]);

  useEffect(() => {
    if (view === 'dashboard' && user) {
      CasesService.getMyCases().then(setMyCases);
    }
  }, [view, user]);

  useEffect(() => {
    if (selectedCaseId) {
      // For now, still using mock for specific case details extraction
      const data = CasesService.getMockCaseDetails(selectedCaseId);
      setCaseDetails(data);
    }
  }, [selectedCaseId]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('landing'); setSelectedCaseId(null); }}>
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Scale className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight">عَـدْل</h1>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">القضاء البسيط</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <button onClick={() => { setView('landing'); setSelectedCaseId(null); }} className={`hover:text-white transition-colors ${view === 'landing' ? 'text-white' : ''}`}>الرئيسية</button>
            <button onClick={() => { setView('dashboard'); setSelectedCaseId(null); }} className={`hover:text-white transition-colors ${view === 'dashboard' ? 'text-white' : ''}`}>قضاياي</button>
            <a href="#" className="hover:text-white transition-colors">المحكمون</a>
            <a href="#" className="hover:text-white transition-colors">عن المنصة</a>
          </div>

          <div className="flex items-center gap-4">
            {loadingUser ? (
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold">{user.displayName}</p>
                  <button onClick={handleSignOut} className="text-[10px] text-white/40 hover:text-red-400">خروج</button>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden ring-2 ring-gold-500/20">
                   <img src={user.photoURL} alt="profile" referrerPolicy="no-referrer" />
                </div>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="px-5 py-2 rounded-full border border-white/10 text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                دخول
              </button>
            )}
            
            {view !== 'submit' && (
              <button 
                onClick={() => { setView('submit'); setSelectedCaseId(null); }}
                className="px-5 py-2 rounded-full gold-gradient text-black text-sm font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                ابدأ دعواك
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 w-full py-12 md:py-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-xs font-semibold text-gold-400 mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                    </span>
                    جلسات مباشرة الآن
                  </div>
                  <h2 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6">
                    العدالة بصوتك، <br /> 
                    <span className="text-transparent bg-clip-text gold-gradient">بكل بساطة.</span>
                  </h2>
                  <p className="text-lg text-white/60 mb-10 leading-relaxed max-w-xl">
                    حل النزاعات اليومية، الديون، والقضايا الأسرية في جلسات تصالح وقضاء بسيط بالصوت. دون الحاجة لرهبة المحاكم أو تكاليف المحامين.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setView('submit')}
                      className="px-8 py-4 gold-gradient text-black font-bold rounded-2xl flex items-center gap-3 shadow-2xl shadow-gold-500/30 hover:translate-y-[-2px] transition-transform"
                    >
                      قدم أول دعوى صوتية
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="ps-6 flex -space-x-3 rtl:space-x-reverse items-center">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-white/10 overflow-hidden ring-2 ring-gold-500/10">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} alt="user" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                      <div className="ps-6 text-sm text-white/40">
                        <span className="text-white font-bold">+1,200</span> قضية تم حلها بنجاح
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="relative"
                >
                  <div className="aspect-square rounded-[40px] glass-panel relative overflow-hidden group">
                    <div className="absolute inset-0 gold-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center animate-pulse border border-white/10">
                        <MessageSquare className="w-12 h-12 text-gold-500" />
                      </div>
                    </div>
                    
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 left-10 glass-panel p-4 rounded-2xl shadow-2xl border-gold-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-green-500" /></div>
                        <div className="text-xs">
                          <p className="font-bold">حكم مُوثق</p>
                          <p className="text-white/40">سند تنفيذي معتمد</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </main>
          </motion.div>
        )}

        {view === 'submit' && (
          <motion.div 
            key="submit"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <CaseSubmissionView onBack={() => setView('landing')} />
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 w-full py-12"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-display font-bold">قضاياي النشطة</h2>
              <div className="flex gap-4">
                <div className="glass-panel px-4 py-2 rounded-xl text-sm font-medium border border-white/5">قيد النظر (3)</div>
                <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-xl text-sm font-medium border border-green-500/20">مكتملة (12)</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
              {myCases.length > 0 ? myCases.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedCaseId(item.id)}
                  className="glass-panel p-6 rounded-2xl hover:border-gold-500/30 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">#{item.id.slice(-4)}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.status === 'hearing_scheduled' ? 'bg-gold-500 text-black' : 'bg-white/5 text-white/40'}`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-gold-500 transition-colors uppercase">{item.title}</h4>
                  <p className="text-sm text-white/40 mb-6 flex items-center gap-2">الخصم: <span className="text-white/80 font-medium">{item.defendantName}</span></p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/20">منذ قليل</span>
                    <div className="flex items-center gap-1 text-gold-500 font-bold">
                      التفاصيل <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="md:col-span-2 glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Gavel className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-white/40">لا توجد قضايا نشطة حالياً</p>
                </div>
              )}
              
              <button 
                onClick={() => setView('submit')}
                className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 hover:bg-white/5 hover:border-gold-500/20 transition-all group"
              >
                <PlusCircle className="w-12 h-12 text-white/10 group-hover:text-gold-500 mb-4 transition-colors" />
                <p className="font-bold text-white/40 group-hover:text-white transition-colors">تقديم دعوى جديدة</p>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Details Modal */}
      <AnimatePresence>
        {selectedCaseId && caseDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCaseId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl glass-panel rounded-[32px] overflow-hidden shadow-2xl border-white/10"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-8 text-right">
                  <div>
                    <h3 className="text-2xl font-display font-bold mb-1">تفاصيل القضية #{caseDetails.id}</h3>
                    <p className="text-sm text-white/40">تم الرفع عبر "عدل" بالصوت</p>
                  </div>
                  <button onClick={() => setSelectedCaseId(null)} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6 text-right">
                    <div className="glass-panel p-6 rounded-2xl bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-4 text-gold-500">
                        <FileText className="w-5 h-5" />
                        <h4 className="font-bold">التفريغ النصي للصوت</h4>
                      </div>
                      <p className="text-white/70 leading-relaxed italic">"{caseDetails.transcript}"</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border-gold-500/20 bg-gold-500/[0.02]">
                      <div className="flex items-center gap-2 mb-4 text-gold-500">
                        <BrainCircuit className="w-5 h-5" />
                        <h4 className="font-bold">التحليل الذكي (AI Assistant)</h4>
                      </div>
                      <p className="text-white/80 leading-relaxed mb-4">{caseDetails.aiSummary}</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-gold-500/10 text-gold-500 text-[10px] font-bold">نزاع مالي</span>
                        <span className="px-2 py-1 rounded bg-gold-500/10 text-gold-500 text-[10px] font-bold">اعتراف بالحق</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mb-3">
                        <Calendar className="w-6 h-6 text-black" />
                      </div>
                      <p className="text-xs text-white/40 mb-1">موعد الجلسة</p>
                      <p className="font-bold text-sm">٢٥ مايو، ٨:٠٠ مساءً</p>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-white/40" />
                      </div>
                      <p className="text-xs text-white/40 mb-1">القاضي المحكم</p>
                      <p className="font-bold text-sm">عبدالله منصور</p>
                    </div>
                    <button className="w-full gold-gradient py-4 rounded-xl text-black font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      دخول الجلسة الصوتية
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-right">
          <div className="flex items-center gap-3">
            <Scale className="text-gold-500 w-6 h-6" />
            <span className="font-display font-bold">عَـدْل - ٢٠٢٤</span>
          </div>
          <div className="text-white/20 text-sm">
            جميع الحقوق محفوظة لمنظومة عدل الإلكترونية
          </div>
          <div className="flex gap-6 text-sm font-medium text-white/40">
            <a href="#">الشروط</a>
            <a href="#">الخصوصية</a>
            <a href="#">اتصل بنا</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
