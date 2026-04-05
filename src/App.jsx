import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ChevronDown, X } from 'lucide-react';
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

function App() {
  const [openSection, setOpenSection] = useState(null); // 'groom' or 'bride'
  const [selectedIndex, setSelectedIndex] = useState(null);

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

  // 🌟 계좌 정보 데이터 (실제 정보로 수정하세요!)
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
    <div className="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl font-serif text-gray-800 overflow-hidden relative">
      
      {/* 1. 메인 히어로 */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mainImage})` }} />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 text-center text-white mt-auto mb-20 px-4">
          <p className="font-eng text-xs tracking-[0.4em] mb-4 text-white/90">WEDDING INVITATION</p>
          <h1 className="font-eng text-4xl mb-6 font-semibold tracking-tighter drop-shadow-lg">Woojinkyu & Leejiyoung</h1>
          <p className="text-base font-light tracking-[0.2em]">2026. 05. 16. SAT 18:30</p>
        </div>
      </section>

      {/* 2. 초대글 */}
      <section className="py-24 px-8 text-center bg-[#fafaf9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <p className="text-[#a8a29e] mb-8 text-[11px] tracking-[0.3em]">INVITATION</p>
          <p className="text-gray-600 leading-[2.6] text-[15px] font-light break-keep">
            함께 있을 때 가장 나다운 모습이 되고,<br />
            함께 있을 때 미래를 꿈꾸게 하는 사람을 만났습니다.<br /><br />
            저희 두 사람이 믿음과 사랑으로<br />
            한 가정을 이루는 뜻깊은 자리에<br />
            소중한 분들을 모시고자 합니다.
          </p>
        </motion.div>
      </section>

      {/* 3. 갤러리 */}
      <section className="py-20 bg-white">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-eng text-center text-xl tracking-[0.2em] mb-12 text-gray-800">GALLERY</motion.p>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{ rotate: 5, stretch: 20, depth: 100, modifier: 1, slideShadows: false }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="pb-12"
        >
          {galleryData.map((img, index) => (
            <SwiperSlide key={index} className="w-[300px] aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img src={img.thumb} loading="lazy" alt="wedding" className="w-full h-full object-cover cursor-pointer active:scale-95 transition-transform" onClick={() => setSelectedIndex(index)} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 4. 오시는 길 */}
      <section className="py-24 px-6 bg-[#fafaf9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="font-eng text-xl tracking-[0.2em] mb-8 text-gray-800">LOCATION</p>
          <p className="text-lg font-bold text-gray-800 mb-2">서울대학교 연구공원 웨딩홀</p>
          <p className="text-[13px] text-gray-500 mb-10 leading-relaxed italic">서울특별시 관악구 낙성대로 38</p>
          <div className="grid grid-cols-3 gap-3">
            <a href="https://map.naver.com/v5/search/서울대학교연구공원웨딩홀" target="_blank" rel="noreferrer" className="py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-400 shadow-sm active:bg-gray-50 uppercase tracking-tighter">네이버</a>
            <a href="https://map.kakao.com/link/search/서울대학교연구공원웨딩홀" target="_blank" rel="noreferrer" className="py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-400 shadow-sm active:bg-gray-50 uppercase tracking-tighter">카카오</a>
            <a href="tmap://search?name=서울대학교연구공원웨딩홀" className="py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-400 shadow-sm active:bg-gray-50 uppercase tracking-tighter">티맵</a>
          </div>
        </motion.div>
      </section>

      {/* 5. 마음 전하실 곳 (양가 부모님 포함) */}
      <section className="py-24 px-6 bg-white">
        <p className="font-eng text-center text-xl tracking-[0.2em] mb-10 text-gray-800">MIND</p>
        
        {['groom', 'bride'].map((side) => (
          <div key={side} className="mb-4 bg-[#fafaf9] rounded-2xl border border-gray-50 overflow-hidden shadow-sm">
            <button 
              onClick={() => setOpenSection(openSection === side ? null : side)} 
              className="w-full px-6 py-5 flex justify-between items-center text-[14px] font-semibold text-gray-700"
            >
              {accountData[side].title} <ChevronDown size={14} className={`text-gray-400 transition-transform ${openSection === side ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openSection === side && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-2 overflow-hidden">
                  {accountData[side].accounts.map((acc, idx) => (
                    <div key={idx} className="py-4 border-t border-gray-200/50 flex justify-between items-center last:border-b-0">
                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">{acc.name}</p>
                        <p className="text-[13px] text-gray-600 font-medium">{acc.bank} {acc.number}</p>
                      </div>
                      <button onClick={() => copyToClipboard(acc.number)} className="text-[10px] px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-xs active:scale-95 text-gray-500 font-bold uppercase">복사</button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      <footer className="bg-[#1c1917] py-16 text-center">
        <p className="text-[11px] tracking-[0.4em] text-white/30 uppercase font-eng">Woojinkyu & Leejiyoung</p>
      </footer>

      {/* 6. 모달 */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedIndex(null)} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X size={28} /></button>
            <motion.img key={selectedIndex} src={galleryData[selectedIndex].full} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-full max-h-[85dvh] object-contain rounded shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;