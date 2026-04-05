import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ChevronDown, X, CalendarDays, MapPin } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';

// CSS 임포트
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// 사진 임포트 (src/assets 폴더 기준)
import mainImage from './assets/main.jpg';
import sub0 from './assets/sub0.jpg';
import sub0Full from './assets/sub0_full.jpg';
import sub1 from './assets/sub1.jpg';
import sub1Full from './assets/sub1_full.jpg';
import sub2 from './assets/sub2.jpg';
import sub2Full from './assets/sub2_full.jpg';
import sub3 from './assets/sub3.jpg';
import sub3Full from './assets/sub3_full.jpg';

// 애니메이션 베리언트
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2, delayChildren: 0.1 } 
  }
};

// 섹션 구분용 나뭇잎 SVG 아이콘
const LeafDivider = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto my-16 opacity-30">
    <path d="M24 2C24 2 21.5 8 16 8C10.5 8 2 6 2 6C2 6 8 10.5 8 16C8 21.5 2 24 2 24C2 24 8 21.5 16 21.5C24 21.5 24 24 24 24C24 24 24 21.5 32 21.5C40 21.5 46 24 46 24C46 24 40 21.5 40 16C40 10.5 46 6 46 6C46 6 37.5 8 32 8C26.5 8 24 2 24 2Z" stroke="#8B7E74" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function App() {
  const [openSection, setOpenSection] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dDay, setDDay] = useState('');

  // D-day 계산 로직
  useEffect(() => {
    const calculateDDay = () => {
      const targetDate = new Date('2026-05-16T18:30:00');
      const now = new Date();
      const gap = targetDate - now;
      if (gap < 0) {
        setDDay('행복하세요!');
      } else {
        const days = Math.ceil(gap / (1000 * 60 * 60 * 24));
        setDDay(`${days}`);
      }
    };
    calculateDDay();
    const timer = setInterval(calculateDDay, 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('계좌번호가 복사되었습니다.');
  };

  const galleryData = [
    { thumb: sub0, full: sub0Full },
    { thumb: sub1, full: sub1Full },
    { thumb: sub2, full: sub2Full },
    { thumb: sub3, full: sub3Full },
  ];

  const accountData = {
    groom: {
      title: "신랑측 마음 전하실 곳",
      accounts: [
        { name: "신랑 우진규", bank: "국민은행", number: "123-456-7890" },
        { name: "부 우승호", bank: "우리은행", number: "000-000-000000" },
        { name: "모 신미순", bank: "농협은행", number: "000-0000-0000-00" },
      ]
    },
    bride: {
      title: "신부측 마음 전하실 곳",
      accounts: [
        { name: "신부 이지영", bank: "신한은행", number: "098-765-4321" },
        { name: "부 이준희", bank: "기업은행", number: "000-000-000000" },
        { name: "모 이미례", bank: "하나은행", number: "000-000-000000" },
      ]
    }
  };

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl font-serif text-gray-800 overflow-hidden relative selection:bg-rose-50">
      
      {/* 1. 메인 히어로 */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mainImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <motion.div 
          className="relative z-10 text-center text-white mt-auto mb-20 px-4"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="font-eng text-xs tracking-[0.4em] mb-4 text-white/90">THE WEDDING DAY</motion.p>
          <motion.h1 variants={fadeUp} className="font-eng text-5xl mb-6 font-semibold tracking-tight drop-shadow-lg text-white">Woojinkyu & Leejiyoung</motion.h1>
          <motion.p variants={fadeUp} className="text-base font-light tracking-[0.2em] mb-2 text-white">2026. 05. 16. SAT 18:30</motion.p>
          <motion.p variants={fadeUp} className="text-xs font-light tracking-[0.1em] text-white/80">서울대학교 연구공원 웨딩홀</motion.p>
        </motion.div>
      </section>

      {/* 2. D-day 섹션 */}
      <section className="py-16 px-6 bg-white border-b border-gray-100">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <CalendarDays size={20} className="mx-auto text-rose-300 mb-5" strokeWidth={1}/>
          <p className="text-gray-500 mb-4 text-xs font-medium tracking-widest">예식까지 남은 시간</p>
          <div className="flex justify-center items-end gap-1.5 font-eng">
            <span className="text-6xl font-extrabold text-gray-900 tabular-nums tracking-tighter">{dDay}</span>
            <span className="text-xl font-bold text-gray-400 mb-1">{dDay === '행복하세요!' ? '' : 'DAYS'}</span>
          </div>
        </motion.div>
      </section>

      <LeafDivider />

      {/* 3. 초대글 (태그 오류 수정 완료) */}
      <section className="py-24 px-8 text-center bg-[#FAF8F5]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          <motion.p variants={fadeUp} className="font-eng text-xs tracking-[0.3em] text-[#a8a29e] mb-12">INVITATION</motion.p>
          <motion.h3 variants={fadeUp} className="text-2xl font-bold mb-12 text-gray-900 tracking-tight">초대합니다</motion.h3>
          {/* 🌟 여기서 </p>를 </motion.p>로 수정했습니다 */}
          <motion.p variants={fadeUp} className="text-gray-600 leading-[2.6] text-[15px] font-light break-keep px-2">
            함께 있을 때 가장 나다운 모습이 되고,<br />
            함께 있을 때 미래를 꿈꾸게 하는 사람을 만났습니다.<br /><br />
            저희 두 사람이 믿음과 사랑으로<br />
            한 가정을 이루는 뜻깊은 자리에<br />
            소중한 분들을 모시고자 합니다.
          </motion.p> 
        </motion.div>
      </section>

      <LeafDivider />

      {/* 4. 갤러리 */}
      <section className="py-20 bg-white">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-eng text-center text-2xl tracking-[0.2em] mb-16 text-gray-900">GALLERY</motion.p>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{ rotate: 5, stretch: 15, depth: 100, modifier: 1, slideShadows: true }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="pb-16"
        >
          {galleryData.map((img, index) => (
            <SwiperSlide key={index} className="w-[300px] aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img src={img.thumb} loading="lazy" alt="wedding" className="w-full h-full object-cover cursor-pointer active:scale-98 transition-transform" onClick={() => setSelectedIndex(index)} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <LeafDivider />

      {/* 5. 오시는 길 */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <MapPin size={20} className="mx-auto text-rose-300 mb-8" strokeWidth={1.5}/>
          <p className="font-eng text-2xl tracking-[0.2em] mb-10 text-gray-900">LOCATION</p>
          <p className="text-xl font-bold text-gray-900 mb-3 tracking-tight">서울대학교 연구공원 웨딩홀</p>
          <p className="text-[14px] text-gray-500 mb-12 leading-relaxed italic px-4 break-keep">서울특별시 관악구 낙성대로 38<br/>(낙성대동 1622-4)</p>
          
          <div className="grid grid-cols-3 gap-3.5 px-2">
            {['네이버', '카카오', '티맵'].map((map) => (
              <a 
                key={map}
                href={map === '네이버' ? "https://map.naver.com/v5/search/서울대학교연구공원웨딩홀" : map === '카카오' ? "https://map.kakao.com/link/search/서울대학교연구공원웨딩홀" : "tmap://search?name=서울대학교연구공원웨딩홀"} 
                target="_blank" rel="noreferrer" 
                className="py-3.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-500 shadow-sm active:bg-gray-50 active:scale-98 transition-all uppercase tracking-tighter"
              >
                {map}
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      <LeafDivider />

      {/* 6. 마음 전하실 곳 */}
      <section className="py-24 px-6 bg-white">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-eng text-center text-2xl tracking-[0.2em] mb-12 text-gray-900">MIND</motion.p>
        
        {['groom', 'bride'].map((side) => (
          <div key={side} className="mb-5 bg-[#FAF8F5] rounded-3xl border border-gray-50 overflow-hidden shadow-inner">
            <button 
              onClick={() => setOpenSection(openSection === side ? null : side)} 
              className="w-full px-7 py-6 flex justify-between items-center text-[15px] font-semibold text-gray-800 tracking-tight"
            >
              {accountData[side].title} <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${openSection === side ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openSection === side && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="px-7 pb-2 overflow-hidden">
                  {accountData[side].accounts.map((acc, idx) => (
                    <div key={idx} className="py-5 border-t border-gray-200/50 flex justify-between items-center last:border-b-0">
                      <div>
                        <p className="text-[11px] text-gray-400 mb-1 tracking-wider uppercase font-sans">{acc.name}</p>
                        <p className="text-[14px] text-gray-700 font-medium tabular-nums">{acc.bank} {acc.number}</p>
                      </div>
                      <button onClick={() => copyToClipboard(acc.number)} className="text-[11px] px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-xs active:scale-95 text-gray-500 font-medium transition">복사</button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      <footer className="bg-[#1c1917] py-20 text-center">
        <p className="text-[12px] tracking-[0.5em] text-white/30 uppercase font-eng drop-shadow-sm">Woojinkyu & Leejiyoung</p>
      </footer>

      {/* 7. 모달 */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setSelectedIndex(null)} 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          >
            <button className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"><X size={32} strokeWidth={1.5} /></button>
            <motion.img 
              key={selectedIndex} src={galleryData[selectedIndex].full} 
              initial={{ scale: 0.85, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="max-w-full max-h-[88dvh] object-contain rounded-lg shadow-3xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;