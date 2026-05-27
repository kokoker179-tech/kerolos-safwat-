import { useState, useEffect } from 'react';

export const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
      {[ { label: 'يوم', val: timeLeft.days }, { label: 'ساعة', val: timeLeft.hours }, { label: 'دقيقة', val: timeLeft.minutes }, { label: 'ثانية', val: timeLeft.seconds } ].map((item, i) => (
        <div key={i} className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl font-black text-pink-500">{item.val}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
