import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { useAqi } from '../context/AqiContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LanguagePicker from '../components/common/LanguagePicker';
import {
  MessageSquareQuote,
  Sparkles,
  Send,
  User,
  Bot,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export default function AssistantPage() {
  const { aqiData, currentLocation, weatherData } = useAqi();
  const { language } = useLanguage();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your Nirmal Environmental Intelligence Assistant. I am monitoring live air quality in ${currentLocation.city} (Current CPCB AQI: ${aqiData?.cpcbAqi || 150}, PM2.5: ${aqiData?.pollutants?.pm25 || 85} µg/m³).\n\nAsk me anything about daily routine timing, window ventilation windows, route exposure, or indoor air purification in English, हिन्दी, or मराठी.`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    const newMsgList = [...messages, userMsg];
    setMessages(newMsgList);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({
        messages: newMsgList,
        language,
        coordinates: currentLocation.coordinates,
      });

      if (res.data?.success) {
        setMessages([...newMsgList, { role: 'assistant', content: res.data.data.message }]);
      }
    } catch (err) {
      setMessages([
        ...newMsgList,
        {
          role: 'assistant',
          content: 'I encountered an issue processing that environmental query. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterPrompts = [
    'Is it safe for a morning jog today?',
    'When should I open my windows today?',
    'How do I calculate purifier CADR for my bedroom?',
    'खिडक्या उघडू का?',
    'बच्चों के लिए आज क्या सावधानी बरतें?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-forest-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-forest-900 dark:text-white">
              Nirmal Environmental Assistant
            </h1>
            <p className="text-xs text-forest-600 dark:text-forest-400">
              Context-Aware Clean Air Advisor · {currentLocation.city}
            </p>
          </div>
        </div>

        <LanguagePicker variant="full" />
      </div>

      {/* Chat Messages Card */}
      <Card padding="p-4 sm:p-6" className="h-[520px] flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  m.role === 'user'
                    ? 'bg-forest-800 text-white'
                    : 'bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-200'
                }`}
              >
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-forest-800 text-white rounded-tr-xs'
                    : 'bg-forest-50/80 dark:bg-forest-900/30 text-forest-900 dark:text-gray-100 border border-forest-100 dark:border-white/5 rounded-tl-xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 flex items-center justify-center text-xs shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-2xl bg-forest-50 dark:bg-forest-900/30 text-xs text-forest-600 dark:text-forest-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-ping" />
                <span>Formulating personalized clean air advisory...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Prompt Pills */}
        <div className="pt-3 border-t border-forest-100/60 dark:border-white/5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {starterPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-forest-50 dark:bg-forest-900/40 hover:bg-forest-100 text-forest-800 dark:text-forest-200 border border-forest-100 dark:border-white/5 whitespace-nowrap transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about air quality, jogging safety, or window timing..."
              className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              icon={Send}
              className="font-semibold"
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
