import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import axios from 'axios';

const OLLAMA_URL = "http://185.190.140.93:11434/api/generate";

export class CasesService {
  static async submitCase(data: { title: string, type: string, defendantName: string, audioUrl?: string }) {
    const path = 'cases';
    try {
      if (!auth.currentUser) throw new Error("User must be signed in to submit a case");
      
      const docRef = await addDoc(collection(db, path), {
        ...data,
        status: 'pending',
        plaintiffId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async getMyCases() {
    const path = 'cases';
    try {
      if (!auth.currentUser) return [];
      const q = query(collection(db, path), where('plaintiffId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  static async analyzeCase(voiceDescription: string) {
    try {
      // simulate a call to the provide Ollama endpoint or use Gemini
      const response = await axios.post(OLLAMA_URL, {
        model: "qwen2.5:1.5b",
        prompt: `حلل هذه الدعوى القضائية باللغة العربية وقدم ملخصاً قانونياً بسيطاً: ${voiceDescription}`,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      console.warn("AI Service not available, using fallback simulation");
      return "تم تحليل الدعوى: نزاع مالي حول مبلغ 100 ألف ريال. الحجج المقدمة تبدو متماسكة وبحاجة لرد الطرف الآخر.";
    }
  }

  static getMockCaseDetails(id: string) {
    return {
      id,
      transcript: "أنا أحمد سالم، أطالب محمد علي بمبلغ 100 ألف ريال سلفة من رمضان الماضي، وهو يماطل في السداد رغم وعوده المتكررة.",
      aiSummary: "دعوى مالية صريحة. المدعي يمتلك أدلة اعتراف بالدين. التوصية: جلسة صلح عاجلة.",
      status: "بانتظار الجلسة",
      hearingDate: "2024-05-15T20:00:00Z"
    };
  }
}
