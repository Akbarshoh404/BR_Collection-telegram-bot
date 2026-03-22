import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ChevronRight } from 'lucide-react';
import { telegram } from '../utils/telegram';

const slides = [
  { id: 1, title: 'Premium Menswear', subtitle: 'Elevate your wardrobe with our carefully curated collection of modern classics.', image: 'https://picsum.photos/seed/BR1/800/1200' },
  { id: 2, title: 'Tailored Fit', subtitle: 'Experience the perfect fit designed specifically for modern gentlemen.', image: 'https://picsum.photos/seed/BR2/800/1200' },
  { id: 3, title: 'Seamless Style', subtitle: 'Shop effortlessly directly from Telegram with exclusive member benefits.', image: 'https://picsum.photos/seed/BR3/800/1200' },
];

const OnboardingScreen = () => {
  const { setHasSeenOnboarding } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (telegram?.BackButton) telegram.BackButton.hide();
  }, []);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      setHasSeenOnboarding(true);
      navigate('/home');
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex flex-col">
      <AnimatePresence initial={false} mode="wait">
        <motion.img 
          key={currentSlide}
          src={slides[currentSlide].image}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.70]"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

      <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-14 text-white">
        <div className="flex space-x-2.5 mb-8">
          {slides.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-10 bg-accent-gold shadow-[0_0_10px_rgba(184,149,42,0.8)]' : 'w-2 bg-white/30'}`} />
          ))}
        </div>

        <motion.div
          key={`text-${currentSlide}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="text-[40px] font-serif font-bold leading-[1.1] mb-4 tracking-tight shadow-black drop-shadow-md">{slides[currentSlide].title}</h1>
          <p className="text-white/80 text-lg leading-relaxed mb-12 max-w-[95%]">{slides[currentSlide].subtitle}</p>
        </motion.div>

        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={handleNext}
          className="w-full bg-accent-gold text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-[0_8px_25px_rgba(184,149,42,0.4)] transition-all text-lg tracking-wide"
        >
          <span>{currentSlide === slides.length - 1 ? "Start Shopping" : "Next"}</span>
          <ChevronRight size={22} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
