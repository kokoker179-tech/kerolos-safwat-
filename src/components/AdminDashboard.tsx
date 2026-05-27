import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { Trash2, RefreshCw, Users, BookOpen, BarChart3 } from 'lucide-react';
import { BookingStats } from './BookingStats';

interface Booking {
  id: string;
  name: string;
  phone: string;
  gender: string;
  year: string;
  createdAt: any;
}

export const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const db = getDb();
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookingsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    setBookings(bookingsData);
    setLoading(false);
  };

  const deleteBooking = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      const db = getDb();
      await deleteDoc(doc(db, 'bookings', id));
      fetchBookings();
    }
  };

  useEffect(() => {
    fetchBookings();
    
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-black">لوحة التحكم</h1>
          <button onClick={fetchBookings} className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all" disabled={loading}>
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-3xl bg-[#111] border border-white/10 flex items-center gap-4">
                <div className="p-4 bg-pink-500/10 rounded-2xl text-pink-500">
                    <Users className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-gray-400 text-sm">إجمالي الحجوزات</p>
                    <p className="text-3xl font-black">{bookings.length}</p>
                </div>
            </div>
            <BookingStats bookings={bookings} />
        </div>
        
        <div className="grid gap-4">
          {bookings.length === 0 ? (
              <div className="p-10 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-3xl">لا توجد حجوزات حالياً.</div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="p-6 rounded-3xl bg-[#111] border border-white/10 flex justify-between items-center hover:border-pink-500/30 transition-all">
                <div className='flex gap-6 items-center'>
                    <div className='w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-bold'>{booking.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{booking.name}</h3>
                      <div className='flex flex-wrap gap-4 text-gray-400 text-sm mt-1'>
                        <span>1. الهاتف: {booking.phone}</span>
                        <span>2. النوع: {booking.gender}</span>
                        <span>3. السنة: {booking.year}</span>
                      </div>
                    </div>
                </div>
                <button onClick={() => deleteBooking(booking.id)} className="p-4 bg-red-500/5 text-red-500 rounded-2xl hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
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
};
