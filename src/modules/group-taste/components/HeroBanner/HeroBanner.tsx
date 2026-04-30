import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import './HeroBanner.css';

// CÁCH THÊM ẢNH CỦA BẠN:
// 1. Dán file ảnh vào thư mục: src/modules/group-taste/assets/banners
// 2. Import ảnh vào đây (ví dụ: import myBanner from '../../assets/banners/my-file.jpg')
// 3. Đưa biến vào mảng DEFAULT_IMAGES dưới đây.

import picture1 from '../../assets/banners/group_1.png';
import picture2 from '../../assets/banners/group_2.jpg';
import picture3 from '../../assets/banners/group_3.jpg';
import picture4 from '../../assets/banners/group_4.png';

const DEFAULT_IMAGES = [
  picture1,
  picture2,
  picture3,
  picture4
];

export const HeroBanner: React.FC = () => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Tự động chuyển slide
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 7000); // 7 giây cho cảm giác thong thả cao cấp hơn
    return () => clearInterval(interval);
  }, [currentImgIndex]);

  // Điều hướng Slide
  const handlePrev = () => {
    if (isChanging) return;
    setIsChanging(true);
    setCurrentImgIndex((prev) => (prev - 1 + DEFAULT_IMAGES.length) % DEFAULT_IMAGES.length);
    setTimeout(() => setIsChanging(false), 800);
  };

  const handleNext = () => {
    if (isChanging) return;
    setIsChanging(true);
    setCurrentImgIndex((prev) => (prev + 1) % DEFAULT_IMAGES.length);
    setTimeout(() => setIsChanging(false), 800);
  };

  // Xử lý Parallax Nâng cao (Phân tầng rõ rệt)
  useEffect(() => {
    let animationFrameId: number;
    let lastScrollY = window.scrollY;

    const updateParallax = () => {
      if (!containerRef.current || !bgRef.current || !contentRef.current) return;

      const scrollY = window.scrollY;
      const rect = containerRef.current.getBoundingClientRect();
      
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        // 1. Background moves SLIGHTLY UP (negative translateY)
        const bgTranslateY = -(scrollY * 0.15);
        // 2. Content moves UP faster
        const contentTranslateY = -(scrollY * 0.35);
        // 3. Blur & Scale subtle
        const blurAmount = Math.min(scrollY / 150, 8); 
        const scaleAmount = 1 + (scrollY / 5000);
        // 4. Fade
        const contentOpacity = Math.max(1 - scrollY / (rect.height * 0.8), 0);

        bgRef.current.style.transform = `translate3d(0, ${bgTranslateY}px, 0) scale(${scaleAmount})`;
        bgRef.current.style.filter = `blur(${blurAmount}px) brightness(0.85)`;
        
        contentRef.current.style.transform = `translate3d(0, ${contentTranslateY}px, 0)`;
        contentRef.current.style.opacity = contentOpacity.toString();
      }
    };

    const onScroll = () => {
      if (lastScrollY !== window.scrollY) {
        lastScrollY = window.scrollY;
        animationFrameId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleCTAClick = () => {
    const scanSection = document.getElementById('scan-section');
    if (scanSection) {
      scanSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hero-banner-container" ref={containerRef}>
      {/* Cinematic Background Slider */}
      <div 
        ref={bgRef}
        className={`hero-banner-bg ${isChanging ? 'slide-changing' : ''}`}
        style={{ backgroundImage: `url(${DEFAULT_IMAGES[currentImgIndex]})` }}
      />
      
      {/* Atmospheric Overlays */}
      <div className="hero-banner-overlay-main" />
      <div className="hero-banner-overlay-bottom" />

      {/* Slide Navigation Arrows */}
      <button className="nav-arrow prev" onClick={handlePrev} aria-label="Slide trước">
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button className="nav-arrow next" onClick={handleNext} aria-label="Slide sau">
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Cinematic Content Layer - 2 line Title */}
      <div className="hero-banner-content" ref={contentRef}>
        <div className="hero-title-wrapper animate-cinematic-load">
          <span className="hero-title-top">Dung Hòa</span>
          <h1 className="hero-title-main">Khẩu Vị Nhóm</h1>
        </div>
        
        <p className="hero-subtitle animate-cinematic-load">
          Mỗi người một khẩu vị? Vẫn có nơi làm cả nhóm cùng "wow" <br className="hidden md:block"/>
        </p>
        
        <button 
          className="hero-cta-btn animate-cinematic-load"
          onClick={handleCTAClick}
        >
          Khám phá ngay
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Modern Slide Indicators */}
      <div className="hero-dots-container">
        {DEFAULT_IMAGES.map((_, index) => (
          <button 
            key={index} 
            className={`hero-dot ${index === currentImgIndex ? 'active' : ''}`}
            onClick={() => setCurrentImgIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
