import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ChevronDown, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';

// CSS 임포트
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// 사진 임포트
import mainImage from './assets/main.jpg';
import sub0 from './assets/sub0.jpg';
import sub0Full from './assets/sub0_full.jpg';
import sub1 from './assets/sub1.jpg';
import sub1Full from './assets/sub1_full.jpg';
import sub2 from './assets/sub2.jpg';
import sub2Full from './assets/sub2_full.jpg';
import sub3 from './assets/sub3.jpg';
import sub3Full from './assets/sub3_full.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
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
    transition: { staggerChildren: 0.2 } 
  }
};

function App() {
  const [openSection, setOpenSection] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dDay, setDDay] = useState('');

  useEffect(() => {
    const calculateDDay = () => {
      const targetDate = new Date('2026-05-16T18:30:00');
      const now = new Date();
      const gap = targetDate - now;
      if (gap < 0) {
        setDDay('0');
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
        { name: "신랑 아버님 우승호", bank: "우리은행", number: "000-000-000000" },
        { name: "신랑 어머님 신미순", bank: "농협은행", number: "000-0000-0000-00" },
        { name: "신랑 우진규", bank: "하나은행", number: "123-456-7890" },
      ]
    },
    bride: {
      title: "신부측 마음 전하실 곳",
      accounts: [
        { name: "신부 아버님 이준희", bank: "기업은행", number: "000-000-000000" },
        { name: "신부 어머님 이미례", bank: "하나은행", number: "000-000-000000" },
        { name: "신부 이지영", bank: "신한은행", number: "098-765-4321" },
      ]
    }
  };

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl font-serif text-gray-800 overflow-hidden relative">
      
      {/* 1. 메인 히어로 */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mainImage})` }} />
        <div className="absolute inset-0 bg-black/20" />
        <motion.div 
          className="relative z-10 text-center text-white mt-auto mb-20 px-4"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="font-eng text-xs tracking-[0.4em] mb-4 text-white/90 uppercase text-center">The Wedding Day</motion.p>
          <motion.h1 variants={fadeUp} className="font-eng text-5xl mb-6 font-semibold tracking-tight text-white uppercase text-center">Woo Jinkyu & Lee Jiyoung</motion.h1>
          <motion.p variants={fadeUp} className="text-base font-light tracking-[0.2em] mb-2 text-white text-center">2026. 05. 16. SAT 18:30</motion.p>
          <motion.p variants={fadeUp} className="text-xs font-light tracking-[0.1em] text-white/70 text-center">서울대학교 연구공원 웨딩홀</motion.p>
        </motion.div>
      </section>

      {/* 2. D-day */}
      <section className="py-20 px-6 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="text-gray-400 mb-6 text-[10px] font-medium tracking-[0.3em] uppercase">Days until our wedding day</p>
          <div className="flex justify-center items-end gap-2 font-eng">
            <span className="text-5xl font-bold text-gray-900 tabular-nums tracking-tighter">D-{dDay}</span>
          </div>
        </motion.div>
      </section>

      <hr className="w-8 mx-auto border-gray-200" />

      {/* 3. 초대글 */}
      <section className="py-32 px-8 text-center bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          <motion.p variants={fadeUp} className="font-eng text-[10px] tracking-[0.4em] text-[#a8a29e] mb-16 uppercase text-center">Invitation</motion.p>
          <motion.p variants={fadeUp} className="text-gray-700 leading-[2.8] text-[15px] font-light break-keep text-center">
            함께 있을 때 가장 나다운 모습이 되고,<br />
            함께 있을 때 미래를 꿈꾸게 하는 사람을 만났습니다.<br /><br />
            저희 두 사람이 믿음과 사랑으로<br />
            한 가정을 이루는 뜻깊은 자리에<br />
            소중한 분들을 모시고자 합니다.
          </motion.p>
        </motion.div>
      </section>

      <hr className="w-8 mx-auto border-gray-200" />

      {/* 🌟 4. 갤러리 (양옆 어두워지는 효과 적용) */}
      <section className="py-28 bg-white">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-eng text-center text-xs tracking-[0.4em] mb-16 text-gray-400 uppercase">Gallery</motion.p>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          // stretch와 depth를 조절하여 이미지가 겹치는 느낌을 강화했습니다.
          coverflowEffect={{ rotate: 0, stretch: 50, depth: 150, modifier: 1, slideShadows: false }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="pb-12"
        >
          {galleryData.map((img, index) => (
            <SwiperSlide key={index} className="w-[300px] aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden shadow-md relative">
              {/* isActive를 활용해 활성화된 슬라이드와 아닌 슬라이드를 구분합니다 */}
              {({ isActive }) => (
                <div className="w-full h-full relative cursor-pointer" onClick={() => setSelectedIndex(index)}>
                  <img src={img.thumb} loading="lazy" alt="wedding" className="w-full h-full object-cover" />
                  
                  {/* 중앙에 있지 않은 슬라이드에 어두운 오버레이 깔기 */}
                  <div 
                    className={`absolute inset-0 bg-black/40 transition-opacity duration-500 pointer-events-none ${
                      isActive ? 'opacity-0' : 'opacity-100'
                    }`} 
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <hr className="w-8 mx-auto border-gray-200" />

      {/* 🌟 5. 오시는 길 (지도 버튼 가로 정렬) */}
      <section className="py-32 px-6 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="font-eng text-xs tracking-[0.4em] mb-12 text-gray-400 uppercase">Location</p>
          <p className="text-lg font-bold text-gray-900 mb-4 tracking-tight">서울대학교 연구공원 웨딩홀</p>
          
          <div className="text-[13px] text-gray-500 mb-10 leading-relaxed break-keep">
            <p className="mb-1">서울특별시 관악구 낙성대로 38</p>
            <p className="font-medium text-gray-800">2026년 5월 16일 토요일 오후 6시 30분</p>
            
            <div className="mt-8 pt-8 border-t border-gray-50 max-w-[240px] mx-auto text-gray-400 text-[12px]">
              <p className="font-bold text-gray-500 mb-2 underline underline-offset-4">주차 안내</p>
              <p>연구공원 단지 내 전용 주차장 이용 가능</p>
              <p>(하객 2시간 무료 주차 지원)</p>
            </div>
          </div>
          
          {/* 가로 정렬(flex-row)로 변경된 버튼 영역 */}
          <div className="flex justify-center gap-2 max-w-[320px] mx-auto">
            {['네이버 지도', '카카오맵', '티맵'].map((map) => (
              <a 
                key={map}
                href={map.includes('네이버') ? "https://map.naver.com/v5/search/서울대학교연구공원웨딩홀" : map.includes('카카오') ? "https://map.kakao.com/link/search/서울대학교연구공원웨딩홀" : "tmap://search?name=서울대학교연구공원웨딩홀"} 
                target="_blank" rel="noreferrer" 
                className="flex-1 py-3.5 border border-gray-200 bg-white shadow-sm rounded-md text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors text-center"
              >
                {map}
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      <hr className="w-8 mx-auto border-gray-200" />

      {/* 6. 마음 전하실 곳 */}
      <section className="py-32 px-6 bg-white">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-eng text-xs tracking-[0.4em] mb-16 text-gray-400 uppercase text-center">Mind</motion.p>
        
        {['groom', 'bride'].map((side) => (
          <div key={side} className="mb-4 bg-[#fafafa] rounded-lg overflow-hidden">
            <button 
              onClick={() => setOpenSection(openSection === side ? null : side)} 
              className="w-full px-6 py-5 flex justify-between items-center text-[13px] font-medium text-gray-700"
            >
              {accountData[side].title} <ChevronDown size={14} className={`text-gray-300 transition-transform duration-300 ${openSection === side ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openSection === side && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="px-6 pb-2 overflow-hidden">
                  {accountData[side].accounts.map((acc, idx) => (
                    <div key={idx} className="py-5 border-t border-gray-100 flex justify-between items-center last:border-b-0">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">{acc.name}</p>
                        <p className="text-[13px] text-gray-600 font-medium">{acc.bank} {acc.number}</p>
                      </div>
                      <button onClick={() => copyToClipboard(acc.number)} className="text-[10px] px-2 py-1 text-gray-400 hover:text-gray-900 transition-colors">복사</button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      <footer className="bg-white py-24 text-center border-t border-gray-50">
        <p className="text-[10px] tracking-[0.5em] text-gray-300 uppercase font-eng">Woo Jinkyu & Lee Jiyoung</p>
      </footer>

      {/* 7. 모달 */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setSelectedIndex(null)} 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          >
            <button className="absolute top-10 right-10 text-white/40"><X size={28} /></button>
            <motion.img 
              key={selectedIndex} src={galleryData[selectedIndex].full} 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-[85dvh] object-contain shadow-2xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;