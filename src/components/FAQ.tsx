import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "متى سيقام حفل التخرج؟", a: "سيقام الحفل يوم الخميس الموافق 25 يونيو 2026 في تمام الساعة الثامنة مساءً." },
  { q: "كيف يمكنني حجز تذكرة؟", a: "يمكنك الحجز بسهولة عبر الضغط على زر 'احجز تذكرتك الآن' في الصفحة الرئيسية، وملء بياناتك واختيار وسيلة الدفع." },
  { q: "هل الحفل متاح للجميع؟", a: "نعم، الحفل مفتوح لجميع خريجي هذا العام وذويهم." },
  { q: "هل يوجد زي رسمي للحفل؟", a: "لا يوجد زي رسمي محدد، ولكن ننصح بملابس مناسبة لحفلة خريجين." },
];

export const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 w-full max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-white text-center mb-12 tracking-tight">أسئلة شائعة</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <button
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
              className="w-full p-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-bold text-white">{faq.q}</span>
              <motion.div animate={{ rotate: activeIndex === i ? 180 : 0 }}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {activeIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 text-gray-400"
                >
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};
