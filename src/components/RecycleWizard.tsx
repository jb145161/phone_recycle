import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Database, 
  Monitor, 
  Wrench, 
  Unlock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  Copy,
  Gift,
  TrendingUp,
  User
} from 'lucide-react';
import { calculatePrice } from '../services/gemini';
import { db, auth, signIn, handleFirestoreError, OperationType } from '../firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  runTransaction,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { useParams, useNavigate } from 'react-router-dom';

type Step = 'model' | 'storage' | 'condition' | 'result';

interface SelectionState {
  model: string;
  storage: string;
  screen: string;
  repair: string;
  lock: string;
}

const MODELS = [
  { id: 'iPhone 15', label: 'iPhone 15 系列', icon: <Smartphone className="w-6 h-6" /> },
  { id: 'iPhone 14', label: 'iPhone 14 系列', icon: <Smartphone className="w-6 h-6" /> },
  { id: 'iPhone 13', label: 'iPhone 13 系列', icon: <Smartphone className="w-6 h-6" /> },
  { id: 'iPhone 12', label: 'iPhone 12 系列', icon: <Smartphone className="w-6 h-6" /> },
  { id: 'Other', label: '其他型号', icon: <Smartphone className="w-6 h-6" /> },
];

const STORAGES = ['128G', '256G', '512G', '1TB'];

const CONDITIONS = {
  screen: [
    { id: '完美', label: '屏幕完美', desc: '无任何划痕或磕碰' },
    { id: '划痕', label: '细微划痕', desc: '肉眼可见的轻微使用痕迹' },
    { id: '碎屏', label: '屏幕碎裂', desc: '屏幕有裂纹或显示异常' },
  ],
  repair: [
    { id: '无维修', label: '无维修史', desc: '原厂原封，从未拆机' },
    { id: '有维修', label: '有过维修', desc: '更换过屏幕、电池等部件' },
  ],
  lock: [
    { id: '无锁', label: '无账号锁', desc: '已退出 ID 并抹除数据' },
    { id: '有锁', label: '有账号锁', desc: '无法退出 ID 或激活锁' },
  ]
};

export default function RecycleWizard({ onBack }: { onBack?: () => void }) {
  const { model: urlModel } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>(urlModel ? 'storage' : 'model');
  const [selection, setSelection] = useState<SelectionState>({
    model: urlModel || '',
    storage: '',
    screen: '',
    repair: '',
    lock: ''
  });
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [isSaving, setIsSaving] = useState(false);
  const [boostAmount, setBoostAmount] = useState<number | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);

  const [boostedPrice, setBoostedPrice] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    
    // Check for referral ID in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferrerId(ref);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!evaluationId) return;

    const unsub = onSnapshot(doc(db, 'evaluations', evaluationId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setBoostedPrice(docSnapshot.data().boostedPrice);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `evaluations/${evaluationId}`);
    });

    return () => unsub();
  }, [evaluationId]);

  const handleModelSelect = (model: string) => {
    setSelection({ ...selection, model });
    setStep('storage');
  };

  const handleStorageSelect = (storage: string) => {
    setSelection({ ...selection, storage });
    setStep('condition');
  };

  const handleConditionSelect = (key: keyof SelectionState, value: string) => {
    setSelection({ ...selection, [key]: value });
  };

  const isConditionComplete = selection.screen && selection.repair && selection.lock;

  const reset = () => {
    setSelection({ model: '', storage: '', screen: '', repair: '', lock: '' });
    setStep('model');
    setEvaluationId(null);
    setBoostAmount(null);
  };

  const price = calculatePrice(selection);

  const saveEvaluation = async () => {
    if (!user) {
      try {
        await signIn();
      } catch (e) {
        return;
      }
    }

    setIsSaving(true);
    try {
      const evalData = {
        model: `${selection.model} ${selection.storage}`,
        basePrice: price || 0,
        boostedPrice: price || 0,
        boostCount: 0,
        ownerUid: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'evaluations'), evalData);
      setEvaluationId(docRef.id);

      // If there's a referrer, boost their evaluation
      if (referrerId && referrerId !== docRef.id) {
        await handleReferralBoost(referrerId);
      }

      setStep('result');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'evaluations');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReferralBoost = async (refId: string) => {
    try {
      const refDocRef = doc(db, 'evaluations', refId);
      const refDoc = await getDoc(refDocRef);

      if (refDoc.exists()) {
        const refData = refDoc.data();
        
        // Don't boost if it's the same user
        if (refData.ownerUid === auth.currentUser?.uid) {
          console.log("Cannot boost own evaluation");
          return;
        }

        const randomBoost = Math.floor(Math.random() * 15) + 5; // 5-20 RMB
        
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(refDocRef);
          if (!sfDoc.exists()) return;

          const newBoostedPrice = (sfDoc.data().boostedPrice || sfDoc.data().basePrice) + randomBoost;
          const newBoostCount = (sfDoc.data().boostCount || 0) + 1;

          transaction.update(refDocRef, {
            boostedPrice: newBoostedPrice,
            boostCount: newBoostCount
          });

          const boostRef = doc(collection(db, 'evaluations', refId, 'boosts'));
          transaction.set(boostRef, {
            evaluationId: refId,
            boosterUid: auth.currentUser?.uid,
            amount: randomBoost,
            createdAt: serverTimestamp()
          });
        });
        
        setBoostAmount(randomBoost);
      }
    } catch (error) {
      console.error("Error boosting referral:", error);
    }
  };

  const handleShare = () => {
    if (!evaluationId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?ref=${evaluationId}`;
    
    if (navigator.share) {
      navigator.share({
        title: '帮我助力，手机回收价更高！',
        text: `我正在评估我的 ${selection.model}，点击链接帮我助力，你也可以领红包！`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('链接已复制到剪贴板，快去分享给好友吧！');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-5xl mx-auto shadow-xl">
      {/* Header */}
      <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-100">
        {/* Progress Bar */}
        <div className="flex gap-2">
          {['model', 'storage', 'condition', 'result'].map((s, i) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                ['model', 'storage', 'condition', 'result'].indexOf(step) >= i 
                  ? 'bg-[#07c160]' 
                  : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          {step === 'model' && (
            <motion.div 
              key="model"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 md:space-y-4"
            >
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4 md:mb-6">第一步：选择您的机型</h2>
              <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                {MODELS.map((m) => (
                   <button
                    key={m.id}
                    onClick={() => handleModelSelect(m.id)}
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all ${
                      selection.model === m.id 
                        ? 'border-[#07c160] bg-green-50' 
                        : 'border-white bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`p-2.5 md:p-3 rounded-lg md:rounded-xl ${selection.model === m.id ? 'bg-[#07c160] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {React.cloneElement(m.icon as React.ReactElement, { className: "w-5 h-5 md:w-6 md:h-6" })}
                    </div>
                    <span className="font-medium text-sm md:text-base text-gray-700">{m.label}</span>
                    <ChevronRight className="ml-auto w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'storage' && (
            <motion.div 
              key="storage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 md:space-y-4"
            >
              <button onClick={() => setStep('model')} className="flex items-center gap-1 text-gray-400 text-xs md:text-sm mb-2 md:mb-4">
                <ChevronLeft className="w-4 h-4" /> 返回上一步
              </button>
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4 md:mb-6">第二步：选择存储容量</h2>
              <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                {STORAGES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStorageSelect(s)}
                    className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-center transition-all ${
                      selection.storage === s 
                        ? 'border-[#07c160] bg-green-50 text-[#07c160]' 
                        : 'border-white bg-white text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    <Database className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1.5 md:mb-2 opacity-50" />
                    <span className="font-bold text-base md:text-lg">{s}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'condition' && (
            <motion.div 
              key="condition"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button onClick={() => setStep('storage')} className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                <ChevronLeft className="w-4 h-4" /> 返回上一步
              </button>
              
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> 屏幕状况
                </h3>
                <div className="space-y-2">
                  {CONDITIONS.screen.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleConditionSelect('screen', c.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selection.screen === c.id ? 'border-[#07c160] bg-green-50' : 'border-white bg-white'
                      }`}
                    >
                      <div className="font-bold text-gray-700">{c.label}</div>
                      <div className="text-xs text-gray-400">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> 维修史
                </h3>
                <div className="flex gap-2">
                  {CONDITIONS.repair.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleConditionSelect('repair', c.id)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        selection.repair === c.id ? 'border-[#07c160] bg-green-50' : 'border-white bg-white'
                      }`}
                    >
                      <div className="font-bold text-gray-700 text-sm">{c.label}</div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Unlock className="w-4 h-4" /> 账号锁
                </h3>
                <div className="flex gap-2">
                  {CONDITIONS.lock.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleConditionSelect('lock', c.id)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        selection.lock === c.id ? 'border-[#07c160] bg-green-50' : 'border-white bg-white'
                      }`}
                    >
                      <div className="font-bold text-gray-700 text-sm">{c.label}</div>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center py-8"
            >
              {price !== null ? (
                <>
                  <div className="w-20 h-20 bg-green-100 text-[#07c160] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">评估完成</h2>
                  
                  {boostAmount && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shrink-0">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-orange-800 text-sm">助力成功！</div>
                        <div className="text-xs text-orange-600">您已为好友助力成功，感谢您的参与</div>
                      </div>
                    </motion.div>
                  )}

                  <p className="text-gray-500">您的手机预估回收价为</p>
                  <div className="text-5xl font-black text-[#07c160] my-6 flex flex-col items-center">
                    <div>
                      <span className="text-2xl">¥</span>{boostedPrice || price}
                    </div>
                    {boostedPrice && boostedPrice > (price || 0) && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-2 text-sm bg-green-100 text-[#07c160] px-3 py-1 rounded-full font-bold flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        已助力加价 ¥{boostedPrice - (price || 0)}
                      </motion.div>
                    )}
                  </div>

                  {/* Share to Boost Card */}
                  <div className="bg-gradient-to-br from-[#07c160] to-[#05a351] p-6 rounded-3xl text-white text-left relative overflow-hidden shadow-xl shadow-green-100">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold">分享助力 · 价格翻倍</span>
                      </div>
                      <p className="text-sm opacity-90 mb-4">分享给好友评估，每次助力可随机增加 5-20 元回收金！</p>
                      <button 
                        onClick={handleShare}
                        className="w-full bg-white text-[#07c160] py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <Share2 className="w-5 h-5" /> 立即分享助力
                      </button>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Smartphone className="w-32 h-32 rotate-12" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">评估机型</span>
                      <span className="font-medium text-gray-700">{selection.model} {selection.storage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">屏幕状况</span>
                      <span className="font-medium text-gray-700">{selection.screen}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">维修史</span>
                      <span className="font-medium text-gray-700">{selection.repair}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 px-8">
                    * 最终价格以实机检测为准。我们提供免费上门取件服务，检测后最快1小时打款。
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">无法报价</h2>
                  <p className="text-gray-500 px-6">
                    由于您的手机存在账号锁，我们暂时无法提供在线报价。请先退出 ID 并抹除数据后再试。
                  </p>
                </>
              )}
              
              <button 
                onClick={reset}
                className="w-full bg-[#07c160] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-100 active:scale-95 transition-transform mt-8"
              >
                重新评估
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      {step === 'condition' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 max-w-3xl mx-auto z-30">
          <button
            disabled={!isConditionComplete || isSaving}
            onClick={saveEvaluation}
            className={`w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 ${
              isConditionComplete && !isSaving
                ? 'bg-[#07c160] text-white shadow-lg shadow-green-100' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                正在评估...
              </>
            ) : (
              '立即获取报价'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
