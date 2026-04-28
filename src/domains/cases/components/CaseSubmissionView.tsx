import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Gavel, Users, Banknote, Landmark, ShieldAlert, CheckCircle } from 'lucide-react';
import VoiceRecorder from '../../../shared/components/VoiceRecorder';
import { CasesService } from '../CasesService';
import { auth } from '../../../lib/firebase';

type Step = 'type' | 'details' | 'voice' | 'confirm' | 'success';

const CASE_TYPES = [
  { id: 'financial', label: 'نزاع مالي', icon: Banknote, desc: 'ديون، معاملات تجارية بسيطة' },
  { id: 'family', label: 'خلاف أسري', icon: Users, desc: 'صلح عائلي، ميراث بسيط' },
  { id: 'property', label: 'نزاع عقاري', icon: Landmark, desc: 'حدود، إيجارات، حق مرور' },
  { id: 'other', label: 'أخرى', icon: ShieldAlert, desc: 'أي دعوى صلح أخرى' },
];

export default function CaseSubmissionView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>('type');
  const [caseData, setCaseData] = useState({
    type: '',
    title: '',
    defendantName: '',
    voiceBlob: null as Blob | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = (next: Step) => setStep(next);

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert("يرجى تسجيل الدخول لتقديم دعوى.");
      return;
    }
    setIsSubmitting(true);
    try {
      await CasesService.submitCase({
        title: caseData.title,
        type: caseData.type,
        defendantName: caseData.defendantName,
        // In a real app we would upload the blob to storage first
      });
      setStep('success');
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تقديم الدعوى. يرجى التأكد من تسجيل الدخول.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-2xl font-display font-bold mb-8">ما هو نوع الخلاف؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CASE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setCaseData({ ...caseData, type: type.id });
                    nextStep('details');
                  }}
                  className={`flex items-start gap-4 p-6 rounded-2xl border transition-all text-right ${
                    caseData.type === type.id 
                    ? 'gold-gradient text-black border-transparent shadow-lg shadow-gold-500/20' 
                    : 'bg-white/5 border-white/10 hover:border-white/30 text-white'
                  }`}
                >
                  <type.icon className={`w-8 h-8 mt-1 ${caseData.type === type.id ? 'text-black' : 'text-gold-500'}`} />
                  <div>
                    <p className="font-bold text-lg">{type.label}</p>
                    <p className={`text-sm ${caseData.type === type.id ? 'text-black/60' : 'text-white/40'}`}>{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'details':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-2xl font-display font-bold mb-8">تفاصيل الخصومة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/40 mb-2">اسم الخصم (أو المدعى عليه)</label>
                <input 
                  type="text" 
                  placeholder="محمد أحمد علي..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-gold-500 transition-colors"
                  value={caseData.defendantName}
                  onChange={e => setCaseData({...caseData, defendantName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-2">موضوع الدعوى باختصار</label>
                <input 
                  type="text" 
                  placeholder="دين من شهر رمضان الماضي..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-gold-500 transition-colors"
                  value={caseData.title}
                  onChange={e => setCaseData({...caseData, title: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={() => nextStep('voice')}
              disabled={!caseData.defendantName || !caseData.title}
              className="w-full py-4 gold-gradient rounded-xl text-black font-bold disabled:opacity-50 transition-opacity"
            >
              الخطوة التالية: سجل صوتك
            </button>
            <button onClick={() => setStep('type')} className="w-full py-4 text-white/40 text-sm font-medium">رجوع</button>
          </motion.div>
        );

      case 'voice':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-2xl font-display font-bold mb-8">اشرح قضيتك بالصوت</h3>
            <VoiceRecorder onRecordingComplete={(blob) => setCaseData({...caseData, voiceBlob: blob})} />
            
            <button 
              onClick={() => nextStep('confirm')}
              disabled={!caseData.voiceBlob}
              className="w-full py-4 gold-gradient rounded-xl text-black font-bold disabled:opacity-50 transition-opacity"
            >
              مراجعة الطلب وتقديمه
            </button>
            <button onClick={() => setStep('details')} className="w-full py-4 text-white/40 text-sm font-medium">رجوع</button>
          </motion.div>
        );

      case 'confirm':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-8">
            <div className="w-20 h-20 gold-gradient rounded-full mx-auto flex items-center justify-center">
              <Gavel className="w-10 h-10 text-black" />
            </div>
            <div>
              <h3 className="text-3xl font-display font-bold mb-2">جاهز للإرسال؟</h3>
              <p className="text-white/40">يرجى التأكد من أن جميع البيانات صحيحة قبل رفع الدعوى إلى نظام "عدل".</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-right space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">نوع القضية</span>
                <span className="font-bold">{CASE_TYPES.find(t => t.id === caseData.type)?.label}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">الخصم</span>
                <span className="font-bold">{caseData.defendantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">المسجل الصوتي</span>
                <span className="text-green-400">مكتمل ✅</span>
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 gold-gradient rounded-xl text-black font-bold shadow-2xl shadow-gold-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التقديم...' : 'تقديم الدعوى الآن'}
            </button>
            <button onClick={() => setStep('voice')} className="w-full py-4 text-white/40 text-sm font-medium">رجوع وتعديل</button>
          </motion.div>
        );
      
      case 'success':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-12">
            <div className="w-24 h-24 bg-green-500/10 rounded-full mx-auto flex items-center justify-center border border-green-500/20 text-green-500">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-3xl font-display font-bold mb-4">تم تقديم دعواك بنجاح!</h3>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">سيقوم النظام بتحليل شكواك الصورية وتعيين محكم معتمد في أقرب وقت. سنخطرك عبر الواتساب أو التطبيق.</p>
            </div>
            <button 
              onClick={onBack}
              className="w-full py-4 glass-panel rounded-xl text-white font-bold hover:bg-white/5"
            >
              العودة للرئيسية
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          {['type', 'details', 'voice', 'confirm'].map((s, i) => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step === s ? 'gold-gradient' : (i < ['type', 'details', 'voice', 'confirm'].indexOf(step) ? 'bg-gold-500/40' : 'bg-white/10')}`} />
          ))}
        </div>
      </div>
      {renderStep()}
    </div>
  );
}
