import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  RotateCcw,
  Sparkles,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Check,
  Copy,
} from 'lucide-react';
import { Language, ChatMessage } from '../types';
import { translations } from '../locales/translations';

interface ChatAdvisorPageProps {
  language: Language;
}

export const ChatAdvisorPage: React.FC<ChatAdvisorPageProps> = ({ language }) => {
  const t = translations[language];

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-1',
    role: 'assistant',
    content: language === 'uz'
      ? `Assalomu alaykum! Men **Bank Oson AI** platformasining mustaqil moliyaviy maslahatchisiman.\n\nSizga O‘zbekiston bank xizmatlari, kredit shartnomalari, to‘lovlar, komissiyalar, garov talablari va iste’molchi huquqlari bo‘yicha tushunarli tilda maslahat beraman.\n\nSavolingizni pastdagi maydonga yozing yoki quyidagi tezkor savollardan birini tanlang:`
      : `Здравствуйте! Я независимый финансовый консультант **Bank Oson AI**.\n\nЯ помогу вам разобраться в банковских тарифах, кредитах, комиссиях, залоговых требованиях и правах потребителей в Узбекистане.\n\nЗадайте вопрос в поле ниже или выберите одну из популярных тем:`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: ['O‘zbekiston Respublikasi Markaziy banki (cbu.uz)'],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: history,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Server response was not ok');
      }

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || (language === 'uz' ? 'Kechirasiz, javob shakllanmadi.' : 'Извините, ответ не сформирован.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || ['cbu.uz'],
        isDemo: data.isDemo,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'uz'
          ? 'Tarmoq xatoligi yoki AI server bilan aloqa uzildi. Iltimos, qayta urinib ko‘ring yoki tezkor namunaviy savollardan foydalaning.'
          : 'Произошла ошибка сети или связи с сервером AI. Попробуйте еще раз или воспользуйтесь шаблонами вопросов.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...initialWelcomeMessage,
        id: Date.now().toString(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#0B192C] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{t.chat.title}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/80">
                <Sparkles className="w-3 h-3" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.chat.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
          title={t.chat.newChat}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.chat.newChat}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-md ${
                  isUser
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 text-teal-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-md text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {/* Demo Badge */}
                {message.isDemo && !isUser && (
                  <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                    <AlertCircle className="w-3 h-3" />
                    <span>{t.chat.demoBadge}</span>
                  </div>
                )}

                {/* Markdown content format */}
                <div className="whitespace-pre-wrap break-words space-y-2">
                  {message.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Sources & Copy */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{message.timestamp}</span>
                    {message.sources && message.sources.length > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-teal-400">
                        <ExternalLink className="w-3 h-3" />
                        {message.sources[0]}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="hover:text-white transition flex items-center gap-1"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Nusxalash</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-teal-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse delay-100" />
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse delay-200" />
              <span className="ml-1">AI javob tayyorlamoqda...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips if initial state */}
      {messages.length <= 2 && (
        <div className="px-6 py-2 bg-slate-900/90 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">
            {t.chat.suggestedQuestions}
          </div>
          <div className="flex flex-wrap gap-2">
            {t.chat.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-950 text-slate-300 hover:text-teal-300 border border-slate-700 hover:border-teal-700 transition cursor-pointer text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 bg-[#0B192C] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chat.placeholder}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 shadow-md transition"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t.chat.sendBtn}</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-400 mt-2 text-center">
          {t.chat.disclaimer}
        </p>
      </div>
    </div>
  );
};
