import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Booking {
  year: string;
}

export const BookingStats = ({ bookings }: { bookings: Booking[] }) => {
  const data = useMemo(() => {
    const stats: Record<string, number> = { 'أولي': 0, 'ثانية': 0, 'ثالثة': 0 };
    bookings.forEach(b => {
      if (stats.hasOwnProperty(b.year)) {
        stats[b.year]++;
      }
    });
    return Object.keys(stats).map(year => ({ year, count: stats[year] }));
  }, [bookings]);

  return (
    <div className="p-6 rounded-3xl bg-[#111] border border-white/10">
      <h3 className="text-gray-400 text-sm mb-6">توزيع الحجوزات حسب السنة الدراسية</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="year" stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#ec4899' : index === 1 ? '#8b5cf6' : '#06b6d4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
