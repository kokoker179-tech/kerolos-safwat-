import { MapPin, CalendarDays, Clock } from 'lucide-react';

export const VenueDetails = () => (
  <section className="py-16 px-6 w-full max-w-4xl mx-auto">
    <h2 className="text-3xl font-extrabold text-white mb-10 tracking-tight text-center">مكان الحفل</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-8 rounded-3xl border border-white/10">
      <div className="flex flex-col justify-center gap-6">
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-pink-500 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-1">العنوان</h3>
            <p className="text-gray-400">قاعة الفخامة للحفلات، شارع المعادي الرئيسي، القاهرة.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <CalendarDays className="w-6 h-6 text-pink-500 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-1">التاريخ</h3>
            <p className="text-gray-400">الخميس، 25 يونيو 2026</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Clock className="w-6 h-6 text-pink-500 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-1">الموعد</h3>
            <p className="text-gray-400">يبدأ الحفل في تمام الساعة 8:00 مساءً</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center h-64 md:h-auto">
        <p className="text-gray-500 italic">خريطة الموقع</p>
      </div>
    </div>
  </section>
);
