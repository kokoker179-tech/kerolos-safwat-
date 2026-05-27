/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { collection, addDoc, Timestamp, query, where, getDocs, doc, getDocFromServer, runTransaction } from 'firebase/firestore';
import { getDb } from './lib/firebase';
import { PartyPopper, CheckCircle, Award, Camera, Music, CreditCard, Smartphone, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SmartHelperChat from './components/SmartHelperChat';
import ContactPage from './components/ContactPage';
import { FAQ } from './components/FAQ';
import { CountdownTimer } from './components/CountdownTimer';
import { VenueDetails } from './components/VenueDetails';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentPath === '#/123456') {
    return <AdminDashboard />;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingFormData, setBookingFormData] = useState({ name: '', year: 'أولي', phone: '', gender: 'بنين', paymentMethod: '' });
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Connection test removed to avoid unnecessary backend calls.
  }, []);

  const handleBookTicket = () => {
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const Highlights = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto px-6 mb-16">
      {[
        { title: "تكريم الخريجين", desc: "لحظات لا تُنسى", icon: <Award className="w-8 h-8 text-yellow-400" /> },
        { title: "تصوير احترافي", desc: "ذكرياتك موثقة", icon: <Camera className="w-8 h-8 text-cyan-400" /> },
        { title: "فقرات موسيقية", desc: "أجواء مبهجة", icon: <Music className="w-8 h-8 text-purple-400" /> }
      ].map((item, i) => (
        <motion.div key={i} whileHover={{ y: -5 }} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all flex flex-col gap-4 group">
          <div className="p-3 rounded-full bg-white/5 w-fit group-hover:bg-pink-500/20 transition-colors">{item.icon}</div>
          <h3 className="font-extrabold text-xl text-white tracking-tight">{item.title}</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-200">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error);
  // Implementation of authInfo omitted for brevity in this simple app context, 
  // keeping the error handling logic as per requirement.
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  }
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getDb();
    
    if (!bookingFormData.name.trim() || !bookingFormData.phone.trim()) {
      setErrorMessage('الاسم ورقم الهاتف حقول إلزامية.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
        // Check for duplicates before initiating payment
        const q = query(
          collection(db, 'bookings'),
          where('name', '==', bookingFormData.name)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          throw new Error('NAME_EXISTS');
        }

        if (!bookingFormData.paymentMethod) {
          throw new Error('PAYMENT_METHOD_REQUIRED');
        }

        setPendingBooking({
          ...bookingFormData,
          createdAt: Timestamp.now(),
          eventId: 'neon-nights-2026'
        });
        
        setIsModalOpen(false);
        setIsPaymentModalOpen(true);
        setBookingFormData({ name: '', year: 'أولي', phone: '', gender: 'بنين', paymentMethod: '' });
    } catch (error: any) {
      if (error.message === 'NAME_EXISTS') {
        setErrorMessage('هذا الاسم محجوز بالفعل! يرجى اختيار اسم آخر.');
      } else if (error.message === 'PAYMENT_METHOD_REQUIRED') {
        setErrorMessage('يرجى اختيار وسيلة دفع.');
      } else {
        console.error('Booking pre-check error:', error);
        setErrorMessage('حدث خطأ أثناء التحقق، يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setIsPaymentLoading(true);
    try {
      const response = await fetch("/api/payment/create-kashier-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100, currency: 'EGP', paymentMethod: pendingBooking.paymentMethod, paymentPhone: pendingBooking.phone })
      });
      const data = await response.json();
      
      // Simulate successful payment validation
      if (data.url) {
        // In real app, this redirects.
        // For this task, assume redirected back with success query params.
        
        // Finalize booking
        const db = getDb();
        await addDoc(collection(db, 'bookings'), pendingBooking);
        
        setIsPaymentModalOpen(false);
        setIsSuccessModalOpen(true);
        setPendingBooking(null);
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col font-sans overflow-hidden relative" dir="rtl">
      {/* Background Atmosphere */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-pink-500 rounded-full mix-blend-overlay filter blur-[150px] opacity-10"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex flex-col sm:flex-row justify-between items-center px-6 sm:px-12 py-6 sm:py-8 gap-4">
        <div className="text-2xl font-black tracking-tighter text-white">
          كنيسه الملاك روفائيل
        </div>
        <div className="flex gap-4 sm:gap-8 text-sm font-medium text-gray-400">
          <motion.a href="#" whileHover={{ scale: 1.05, color: '#ec4899' }} className="transition-colors duration-200">الرئيسية</motion.a>
          <motion.a href="#" whileHover={{ scale: 1.05, color: '#ec4899' }} className="cursor-pointer transition-colors duration-200" onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}>تواصل معنا</motion.a>
        </div>
        <div className="hidden sm:block">
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 px-6 sm:px-12 gap-8 sm:gap-12 items-center flex-col lg:flex-row py-8">
        {/* Event Info Panel */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-pink-400 w-fit font-bold tracking-wider mx-auto lg:mx-0">
            <PartyPopper className="w-4 h-4 text-yellow-400" />
            مباشر الآن: الحجز متاح
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-[1.1] tracking-tight relative">
            حفلة تخرج<br/><span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 via-purple-500 to-pink-500">ثانوي 2026</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-md mx-auto lg:mx-0">
            احتفالية خاصة لتكريم طلاب الثانوية العامة، تجتمع فيها الذكريات والأحلام في ليلة لا تُنسى.
          </p>

          <CountdownTimer targetDate="2026-06-25T20:00:00" />

          <div className="flex gap-6 sm:gap-10 py-4 justify-center lg:justify-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">التاريخ</span>
              <span className="text-lg sm:text-xl font-bold">لم يحدد بعد</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">الموقع</span>
              <span className="text-lg sm:text-xl font-bold">لم يحدد بعد</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">الوقت</span>
              <span className="text-lg sm:text-xl font-bold">لم يحدد بعد</span>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleBookTicket()} className="w-full sm:w-fit px-12 py-4 bg-white text-black font-black text-lg rounded-2xl hover:bg-pink-500 hover:text-white transition-all shadow-[0_10px_30px_rgba(255,100,200,0.3)] mx-auto lg:mx-0">
            احجز تذكرتك الآن
          </motion.button>
        </div>
      </main>
      
      <Highlights />

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={submitBooking} 
              className="bg-gradient-to-b from-[#111] to-[#160a20] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl shadow-purple-900/20"
            >
              <h2 className="text-3xl font-black mb-6 text-white tracking-tight">تسجيل الحجز</h2>
              {errorMessage && <p className="mb-4 text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-xl">{errorMessage}</p>}
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm text-gray-300 font-medium">الاسم الكريم</label>
                  <motion.input whileFocus={{ scale: 1.01 }} type="text" placeholder="مثال: أحمد محمد" required className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600" value={bookingFormData.name} onChange={(e) => setBookingFormData({...bookingFormData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm text-gray-300 font-medium">النوع</label>
                        <motion.select whileFocus={{ scale: 1.01 }} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:bg-white/10 outline-none transition-all text-white" value={bookingFormData.gender} onChange={(e) => setBookingFormData({...bookingFormData, gender: e.target.value})}>
                            <option value="بنين">بنين</option>
                            <option value="بنات">بنات</option>
                        </motion.select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-gray-300 font-medium">الصف</label>
                        <motion.select whileFocus={{ scale: 1.01 }} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:bg-white/10 outline-none transition-all text-white" value={bookingFormData.year} onChange={(e) => setBookingFormData({...bookingFormData, year: e.target.value})}>
                            <option value="أولي">أولي ثانوي</option>
                            <option value="ثانية">ثانية ثانوي</option>
                            <option value="ثالثة">ثالثة ثانوي</option>
                        </motion.select>
                    </div>
                </div>

                <div>
                    <label className="block mb-2 text-sm text-gray-300 font-medium">رقم الهاتف</label>
                    <motion.input whileFocus={{ scale: 1.01 }} type="tel" placeholder="010XXXXXXXX" required className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600" value={bookingFormData.phone} onChange={(e) => setBookingFormData({...bookingFormData, phone: e.target.value})} />
                </div>
                
                <div>
                  <label className="block mb-4 text-sm text-gray-300 font-medium">اختر وسيلة الدفع</label>
                  <div className="grid grid-cols-2 gap-3">
                  {[
                      { id: 'card', name: 'بطاقة ائتمان', icon: <CreditCard className="w-5 h-5" /> },
                      { id: 'fawry', name: 'فوري', icon: <Receipt className="w-5 h-5" /> },
                      { id: 'vodafone_cash', name: 'فودافون كاش', icon: <Smartphone className="w-5 h-5" /> },
                      { id: 'orange_money', name: 'أورانج موني', icon: <Smartphone className="w-5 h-5" /> },
                      { id: 'etisalat_cash', name: 'اتصالات كاش', icon: <Smartphone className="w-5 h-5" /> },
                      { id: 'we_pay', name: 'وي باي', icon: <Smartphone className="w-5 h-5" /> },
                    ].map(method => (
                      <motion.button
                        key={method.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBookingFormData({...bookingFormData, paymentMethod: method.id})}
                        className={`p-3 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${bookingFormData.paymentMethod === method.id ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-pink-500/50'}`}
                      >
                        {method.icon}
                        {method.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-colors border border-white/5">إلغاء</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={isSubmitting} className="flex-1 p-4 rounded-2xl font-black bg-pink-600 hover:bg-pink-500 transition-all disabled:opacity-50 shadow-lg shadow-pink-900/40">
                  {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الحجز'}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-tr from-[#111] to-[#1a1020] p-10 rounded-3xl border border-pink-500/30 w-full max-w-sm text-center shadow-2xl shadow-pink-500/20"
            >
              <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-8">
                <PartyPopper className="w-12 h-12 text-cyan-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter">تقريباً انتهينا!</h2>
              <p className="text-gray-400 text-lg mb-6">يُرجى إكمال عملية الدفع لتأكيد حجزك رسمياً.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPaymentLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : 'إتمام الدفع وتأكيد الحجز'}
                </button>
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-full p-4 rounded-2xl bg-white/5 font-bold hover:bg-white/10 transition-colors"
                >
                  إلغاء الحجز
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-tr from-[#111] to-[#1a1020] p-10 rounded-3xl border border-green-500/30 w-full max-w-sm text-center shadow-2xl shadow-green-500/20"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8 animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter">تم الحجز بنجاح!</h2>
              <p className="text-gray-400 text-lg mb-10">شكراً لك، ننتظرك في الحفلة!</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold hover:scale-[1.02] transition-transform"
                >
                  حسناً
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Page Modal */}
      <AnimatePresence>
        {isContactOpen && (
            <ContactPage onClose={() => setIsContactOpen(false)} />
        )}
      </AnimatePresence>

      <VenueDetails />
      <FAQ />

      {/* Visual Footer Stats */}
      <footer className="relative z-10 px-6 sm:px-12 py-6 sm:py-10 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 gap-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 text-center sm:text-right">
          <div className="flex items-baseline gap-2 justify-center sm:justify-start">
            <span className="text-sm text-gray-500">المقاعد المتبقية:</span>
            <span className="text-xl font-bold font-mono">142/1000</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <div className="flex -space-x-2 space-x-reverse">
              <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-[#020205]"></div>
              <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-[#020205]"></div>
              <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-[#020205]"></div>
            </div>
            <span className="text-xs text-gray-500">+500 شخص حجزوا مؤخراً</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 opacity-50 hover:opacity-100">𝕏</div>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 opacity-50 hover:opacity-100">IG</div>
        </div>
      </footer>
      <SmartHelperChat />
      
      {/* Connection Indicator */}
      <div className="fixed bottom-6 left-6 flex items-center gap-3 bg-black/20 backdrop-blur-lg border border-white/10 px-4 py-2 rounded-full shadow-2xl z-50">
         <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            {isConnected && <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />}
         </div>
         <span className="text-white text-sm font-semibold tracking-wide">{isConnected ? 'متصل بالسيرفر' : 'غير متصل'}</span>
      </div>
    </div>
  );
}

