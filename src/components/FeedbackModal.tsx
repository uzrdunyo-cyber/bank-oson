import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';
import { submitFeedback } from '../lib/supabaseClient';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  const [category, setCategory] = useState(t.feedbackModal.categories[0]);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      await submitFeedback({ category, message, rating });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1 text-teal-400">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">
            {t.feedbackModal.title}
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          {t.feedbackModal.subtitle}
        </p>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto animate-bounce" />
            <p className="text-sm font-semibold text-white">
              {t.feedbackModal.successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.feedbackModal.categoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {t.feedbackModal.categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.feedbackModal.ratingLabel}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.feedbackModal.messageLabel}
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Fikr va mulohazalaringiz..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {t.feedbackModal.closeBtn}
              </button>
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? t.feedbackModal.submitting : t.feedbackModal.submitBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
