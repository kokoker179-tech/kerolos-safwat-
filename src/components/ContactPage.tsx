import React, { useState } from 'react';
import { X, Mail, MessageCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactPageProps {
  onClose: () => void;
}

export default function ContactPage({ onClose }: ContactPageProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inquiry submitted:', formData);
    alert('تم إرسال استفسارك بنجاح! شكراً للتواصل.');
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <div className="bg-[#111] p-8 rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative text-right">
        <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold mb-8 text-pink-500">تواصل معنا</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-400"><MessageCircle size={20} /> واتساب: 01554353231</div>
            <div className="flex items-center gap-3 text-gray-400"><Mail size={20} /> keiroloseditor@gmail.com</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="الاسم" required className="w-full p-4 rounded-xl bg-white/5 border border-white/10" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="البريد الإلكتروني" required className="w-full p-4 rounded-xl bg-white/5 border border-white/10" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <textarea placeholder="رسالتك" required className="w-full p-4 h-32 rounded-xl bg-white/5 border border-white/10" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
            <button type="submit" className="w-full p-4 rounded-xl bg-pink-500 font-bold hover:bg-pink-600 transition flex items-center justify-center gap-2">
              <Send size={18} /> إرسال الاستفسار
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
