/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

// Cute Green T-Rex Character Component (Emoji 🦖 Style)
const Dinosaur = ({ state }: { state: 'idle' | 'happy' | 'oops' }) => {
  return (
    <motion.div
      animate={state === 'happy' ? { 
        y: [0, -15, 0], 
        rotate: [0, 8, -8, 0],
        scale: [1, 1.1, 1] 
      } : state === 'oops' ? { x: [-3, 3, -3, 3, 0], rotate: [0, 5, -5, 0] } : {}}
      transition={{ duration: 0.5, repeat: state === 'happy' ? Infinity : 0 }}
      className="w-20 h-20 md:w-24 md:h-24 relative dino-float z-10"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
        <defs>
          <linearGradient id="dinoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* Tail */}
        <path d="M25,70 Q5,70 15,45" stroke="url(#dinoGreen)" strokeWidth="16" strokeLinecap="round" fill="none" />
        
        {/* Body - Classic Dino Shape */}
        <path d="M30,85 Q30,40 65,40 L85,40 Q95,40 95,55 L95,65 Q95,85 75,85 Z" fill="url(#dinoGreen)" />
        <path d="M48,50 Q45,70 60,85 L75,85 Q82,75 75,50 Z" fill="#bbf7d0" opacity="0.4" /> {/* Belly */}
        
        {/* Head */}
        <path d="M60,40 L90,40 Q100,40 100,55 L100,60 Q100,70 90,70 L65,70" fill="url(#dinoGreen)" />
        
        {/* Spikes - Bright Orange */}
        <path d="M40,40 L46,25 L52,40" fill="#f97316" />
        <path d="M58,35 L64,20 L70,35" fill="#f97316" />
        <path d="M76,38 L82,23 L88,38" fill="#f97316" />

        {/* Eye */}
        <g>
          <circle cx="85" cy="50" r="7" fill="white" />
          <motion.circle 
            animate={state === 'happy' ? { scaleY: 0.1 } : { scaleY: 1 }}
            cx="87" cy="50" r="4" fill="#1e293b" 
          />
          <circle cx="88.5" cy="48" r="1.5" fill="white" />
        </g>

        {/* Mouth */}
        {state === 'happy' ? (
           <path d="M75,65 Q85,78 95,65" fill="white" stroke="#064e3b" strokeWidth="1" />
        ) : state === 'oops' ? (
           <circle cx="85" cy="63" r="4" fill="#064e3b" />
        ) : (
           <path d="M80,63 L95,63" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* T-Rex Tiny Arms */}
        <path d="M60,70 Q70,70 68,78" stroke="#14532d" strokeWidth="5" strokeLinecap="round" fill="none" />
        
        {/* Strong Legs */}
        <rect x="45" y="85" width="10" height="12" rx="4" fill="#14532d" />
        <rect x="68" y="85" width="10" height="12" rx="4" fill="#14532d" />
      </svg>
    </motion.div>
  );
};

export default function App() {
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', res: 0 });
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [praise, setPraise] = useState('太棒了');
  const inputRef = useRef<HTMLInputElement>(null);

  const praises = ['太棒了', '好厉害', '你是天才吧', '超级牛', '满分', '绝绝子', '真威武', '太强了'];

  const fireConfetti = () => {
    const end = Date.now() + 1000;
    const colors = ['#4ade80', '#22c55e', '#3b82f6', '#fbbf24', '#f97316'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const generateQuestion = () => {
    const isThreeDigit = Math.random() > 0.5;
    const max = isThreeDigit ? 999 : 99;
    const min = isThreeDigit ? 10 : 1; 
    
    let a = Math.floor(Math.random() * (max - min + 1)) + min;
    let b = Math.floor(Math.random() * (max - min + 1)) + min;
    const op = Math.random() > 0.5 ? '+' : '-';

    if (op === '-' && a < b) [a, b] = [b, a];

    const res = op === '+' ? a + b : a - b;
    setQuestion({ a, b, op, res });
    setAnswer('');
    setFeedback('none');
  };

  useEffect(() => {
    generateQuestion();
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setAnswer(val);
      const resStr = question.res.toString();
      if (val === resStr) handleCorrect();
      else if (val.length >= resStr.length) handleWrong();
    }
  };

  const handleCorrect = () => {
    setFeedback('correct');
    setScore(s => s + 1);
    setStreak(s => s + 1);
    setPraise(praises[Math.floor(Math.random() * praises.length)]);
    fireConfetti();
    setTimeout(() => generateQuestion(), 1200);
  };

  const handleWrong = () => {
    setFeedback('wrong');
    setStreak(0);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setAnswer('');
      setFeedback('none');
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-1 relative font-sans overflow-hidden">
      <div className="sleek-bg" />
      
      {/* Title - Extra Compact */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-2"
      >
        <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-500 tracking-widest uppercase">
          恐龙勇士口算
        </h1>
        <div className="h-0.5 w-20 bg-green-200 mx-auto rounded-full"></div>
      </motion.div>

      {/* Main Card - Extra Compact */}
      <motion.div
        animate={shake ? { x: [-3, 3, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`bg-white/80 backdrop-blur-md px-4 py-4 rounded-[30px] shadow-2xl border-2 border-white flex flex-col items-center gap-3 w-full max-w-[320px] md:max-w-sm ${shake ? 'shake-animation' : ''}`}
      >
        {/* Question Display */}
        <div className="flex items-center gap-1 md:gap-3 py-1 border-b border-green-50 w-full justify-center">
          <div className="text-4xl md:text-5xl font-black text-slate-700">{question.a}</div>
          <div className="text-xl md:text-3xl font-bold text-green-500">{question.op === '+' ? '+' : '-'}</div>
          <div className="text-4xl md:text-5xl font-black text-slate-700">{question.b}</div>
          <div className="text-xl md:text-3xl font-bold text-slate-400">=</div>
        </div>

        {/* Input & Dinosaur Area */}
        <div className="flex flex-row items-center gap-2 w-full justify-center">
          <div className="flex flex-col items-center relative">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 10, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1.4, y: -25, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -50 }}
                  className="bg-gradient-to-br from-green-500 to-blue-600 px-4 py-2 rounded-2xl text-white font-black border-4 border-white shadow-xl whitespace-nowrap z-30 absolute -top-12 left-1/2 -translate-x-1/2"
                >
                  {praise}!
                </motion.div>
              )}
            </AnimatePresence>
            <Dinosaur state={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'oops' : 'idle'} />
          </div>
          
          <div className="flex flex-col gap-1.5 w-28 md:w-32">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={answer}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (answer === question.res.toString()) handleCorrect();
                  else handleWrong();
                }
              }}
              placeholder="?"
              className="w-full h-14 md:h-16 bg-blue-50 border-2 border-blue-100 rounded-2xl text-4xl font-black text-blue-600 outline-none focus:border-blue-300 transition-all text-center placeholder:text-blue-100"
              autoFocus
            />
            <button
              onClick={() => {
                if (answer === question.res.toString()) handleCorrect();
                else handleWrong();
              }}
              className="h-10 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-[0_3px_0_0_#15803d] active:shadow-none active:translate-y-[3px] transition-all text-[12px]"
            >
              确定答案
            </button>
          </div>
        </div>
        
        <button onClick={generateQuestion} className="text-blue-300 hover:text-blue-500 font-bold text-[10px] flex items-center gap-1">
          <RefreshCw size={10} /> 换一题
        </button>
      </motion.div>

      {/* Footer Info - Extra Compact */}
      <div className="mt-3 text-blue-700/60 font-bold text-xs flex gap-4 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
        <span>⭐ 做对: {score}</span>
        <span>🔥 连击: {streak} {streak >= 3 && '🐲'}</span>
      </div>
    </div>
  );
}
