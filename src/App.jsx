import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ChevronDown, X, Volume2, VolumeX, Phone } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';

// CSS 임포트
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// 미디어 임포트
import mainImage from './assets/main.jpg';
import bgmFile from './assets/bgm.mp3';

// Film 이미지 임포트
import film0 from './assets/Film/Film_00.jpg';
import film1 from './assets/Film/Film_01.jpg';
import film2 from './assets/Film/Film_02.jpg';
import film3 from './assets/Film/Film_03.jpg';
import film4 from './assets/Film/Film_04.jpg';
import film5 from './assets/Film/Film_05.jpg';

// Digital 이미지 임포트
import digital0 from './assets/Digital/Digital_00.jpg';
import digital1 from './assets/Digital/Digital_01.jpg';
import digital2 from './assets/Digital/Digital_02.jpg';
import digital3 from './assets/Digital/Digital_03.jpg';
import digital4 from './assets/Digital/Digital_04.jpg';
import digital5 from './assets/Digital/Digital_05.jpg';
import digital6 from './assets/Digital/Digital_06.jpg';
import digital7 from './assets/Digital/Digital_07.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  }
};

function App() {
  const [openSection, setOpenSection] = useState(null);
  const [dDay, setDDay] = useState('');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSection, setContactSection] = useState(null);

  const [heroHeight, setHeroHeight] = useState('100vh');
  
  const [selectedImage, setSelectedImage] = useState(null); 

  useEffect(() => {
    setHeroHeight(`${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          setIsPlaying(false);
        }
      }
    };

    playAudio();

    const handleFirstInteraction = () => {
      playAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };


  useEffect(() => {
    const calculateDDay = () => {
      // 🌟 타겟 시간을 예식 시간이 아닌 '한국 시간 자정(00:00:00+09:00)'으로 변경
      const targetDate = new Date('2026-05-16T00:00:00+09:00').getTime();
      const now = new Date().getTime();
      const gap = targetDate - now;

      if (gap <= 0) {
        setDDay('0');
      } else {
        const days = Math.ceil(gap / (1000 * 60 * 60 * 24));
        setDDay(`${days}`);
      }
    };
    
    calculateDDay();
    
    // 🌟 업데이트 주기는 기존대로 1시간(1000ms * 60초 * 60분) 유지
    const timer = setInterval(calculateDDay, 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, []);

/*
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

*/

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('계좌번호가 복사되었습니다.');
  };

  const filmGalleryData = [
    { thumb: film0, full: film0 },
    { thumb: film1, full: film1 },
    { thumb: film2, full: film2 },
    { thumb: film3, full: film3 },
    { thumb: film4, full: film4 },
    { thumb: film5, full: film5 },
  ];

  const digitalGalleryData = [
    { thumb: digital0, full: digital0 },
    { thumb: digital1, full: digital1 },
    { thumb: digital2, full: digital2 },
    { thumb: digital3, full: digital3 },
    { thumb: digital4, full: digital4 },
    { thumb: digital5, full: digital5 },
    { thumb: digital6, full: digital6 },
    { thumb: digital7, full: digital7 },
  ];

  const accountData = {
    groom: {
      title: "신랑측 마음 전하실 곳",
      accounts: [
        { name: "신랑 우진규", bank: "하나은행", number: "332-910496-77107" },
      ]
    },
    bride: {
      title: "신부측 마음 전하실 곳",
      accounts: [
        { name: "신부 이지영", bank: "신한은행", number: "110-383-665395" },
      ]
    }
  };

  const contactData = {
    groom: {
      title: "신랑측 연락처",
      people: [
        { relation: "신랑 아버지", name: "우승호", phone: "010-2043-1236" },
        { relation: "신랑 어머니", name: "신미순", phone: "010-2044-2581" },
        { relation: "신랑", name: "우진규", phone: "010-4314-2180" },
      ]
    },
    bride: {
      title: "신부측 연락처",
      people: [
        { relation: "신부 아버지", name: "이준희", phone: "010-2185-2495" },
        { relation: "신부 어머니", name: "이미례", phone: "010-5334-0617" },
        { relation: "신부", name: "이지영", phone: "010-6306-9211" },
      ]
    }
  };

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen font-serif text-gray-800 overflow-hidden relative">
      
      <audio ref={audioRef} src={bgmFile} loop autoPlay />

      <button 
        onClick={togglePlay}
        className="fixed bottom-8 right-6 z-[90] p-3.5 bg-white/95 rounded-full shadow-lg border border-gray-100 text-gray-600 transition-transform active:scale-90"
        aria-label="Toggle Music"
        style={{ willChange: 'transform' }}
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* 1. 메인 히어로 */}
      <section 
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ height: heroHeight }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${mainImage})`, willChange: 'transform' }} 
        />
        <div className="absolute inset-0 bg-black/30" />
        {/* 🌟 폰 기종 상관없이 위치 고정 (mt-auto 제거, absolute top-[85%] 사용) */}
        <motion.div 
          className="absolute top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-10 text-center text-white px-4"
          initial="hidden" animate="visible" variants={staggerContainer}
          style={{ willChange: 'opacity, transform' }}
        >
          <motion.p variants={fadeUp} className="font-eng text-[11px] tracking-[0.5em] mb-8 text-white/90 uppercase text-center">
            The Wedding Day
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-eng text-4xl font-semibold tracking-widest text-white uppercase text-center leading-[1.6]">
            Woo-jinkyu<br />
            Lee-jiyoung
          </motion.h1>
        </motion.div>
      </section>

      {/* 2. D-day */}
      <section className="pt-24 pb-16 px-6 bg-white">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="text-center"
          style={{ willChange: 'opacity, transform' }}
        >
          <p className="text-gray-400 mb-6 text-[10px] font-medium tracking-[0.3em] uppercase">Days until our wedding day</p>
          <div className="flex justify-center items-end gap-2 font-eng">
            <span className="text-5xl font-bold text-gray-900 tabular-nums tracking-tighter">D-{dDay}</span>
          </div>
        </motion.div>
      </section>

      {/* 3. 캘린더 달력 섹션 */}
      <section className="pb-32 px-8 bg-white">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="text-center"
          style={{ willChange: 'opacity, transform' }}
        >
          <p className="font-eng text-2xl text-gray-700 mb-3 tracking-widest">2026.05.16</p>
          <p className="text-[13px] text-gray-500 mb-12 font-medium">토요일 오후 6시 30분</p>

          <div className="max-w-[280px] mx-auto text-[13px] text-gray-600">
            <div className="grid grid-cols-7 gap-y-6 mb-5 font-medium text-gray-400">
              <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
            </div>
            <div className="grid grid-cols-7 gap-y-6 items-center justify-items-center">
              <span></span><span></span><span></span><span></span><span></span>
              <span>1</span><span>2</span>
              <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
              
              <span className="relative flex items-center justify-center w-full h-full">
                <span className="absolute w-8 h-8 bg-[#9c8e81] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">16</span>
              </span>
              
              <span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span>
              <span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
              <span>31</span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </motion.div>
      </section>

      <hr className="w-8 mx-auto border-gray-200" />

      {/* 4. 초대글 및 가족 정보 */}
      <section className="pt-24 pb-32 px-8 text-center bg-white">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer}
          style={{ willChange: 'opacity, transform' }}
        >
          <motion.div variants={fadeUp} className="mb-12">
            <p className="text-[17px] font-bold text-gray-900 mb-3 tracking-tight">서울대학교 연구공원 웨딩홀</p>
            <p className="text-[14px] font-medium text-gray-500 tracking-[0.1em]">2026. 05. 16. SAT 18:30</p>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <span className="text-[16px] font-medium text-gray-800 tracking-wider">우승호 · 신미순</span>
              <span className="text-[13px] text-gray-400">아들</span>
              <span className="text-[16px] font-medium text-gray-800 tracking-wider">우진규</span>
            </div>
            <div className="flex justify-center items-center gap-3">
              <span className="text-[16px] font-medium text-gray-800 tracking-wider">이준희 · 이미례</span>
              <span className="text-[13px] text-gray-400">&nbsp;&nbsp;딸&nbsp;&nbsp;</span>
              <span className="text-[16px] font-medium text-gray-800 tracking-wider">이지영</span>
            </div>
          </motion.div>

          <motion.button
            variants={fadeUp}
            onClick={() => setIsContactModalOpen(true)}
            className="bg-[#f5f5f5] text-gray-700 py-3.5 px-16 rounded-md text-[13px] font-medium mb-20 hover:bg-[#ebebeb] transition-colors"
          >
            연락하기
          </motion.button>

          <motion.p variants={fadeUp} className="font-eng text-[10px] tracking-[0.4em] text-[#a8a29e] mb-12 uppercase text-center">Invitation</motion.p>
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

      {/* 5. 갤러리 (FILM / DIGITAL 분할) */}
      <section className="py-28 bg-white">
        <motion.p 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
          className="font-eng text-center text-xs tracking-[0.4em] mb-20 text-gray-400 uppercase"
          style={{ willChange: 'opacity, transform' }}
        >
          Gallery
        </motion.p>
        
        {/* --- FILM 갤러리 --- */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-24">
          <p className="font-eng text-center text-[11px] tracking-[0.3em] mb-10 text-gray-800 font-semibold uppercase">Film</p>
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{ rotate: 0, stretch: 50, depth: 150, modifier: 1, slideShadows: false }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Pagination]}
            className="pb-12"
            watchSlidesProgress={true}
          >
            {filmGalleryData.map((img, index) => (
              <SwiperSlide key={`film-${index}`} className="w-[300px] aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden shadow-sm relative">
                {({ isActive }) => (
                  <div className="w-full h-full relative cursor-pointer" onClick={() => setSelectedImage(img.full)}>
                    <img src={img.thumb} loading="lazy" alt={`wedding film ${index}`} className="w-full h-full object-cover" />
                    <div 
                      className={`absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-none ${
                        isActive ? 'opacity-0' : 'opacity-100'
                      }`} 
                      style={{ willChange: 'opacity' }}
                    />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* --- DIGITAL 갤러리 --- */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="font-eng text-center text-[11px] tracking-[0.3em] mb-10 text-gray-800 font-semibold uppercase">Digital</p>
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{ rotate: 0, stretch: 50, depth: 150, modifier: 1, slideShadows: false }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Pagination]}
            className="pb-12"
            watchSlidesProgress={true}
          >
            {digitalGalleryData.map((img, index) => (
              <SwiperSlide key={`digital-${index}`} className="w-[300px] aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden shadow-sm relative">
                {({ isActive }) => (
                  <div className="w-full h-full relative cursor-pointer" onClick={() => setSelectedImage(img.full)}>
                    <img src={img.thumb} loading="lazy" alt={`wedding digital ${index}`} className="w-full h-full object-cover" />
                    <div 
                      className={`absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-none ${
                        isActive ? 'opacity-0' : 'opacity-100'
                      }`} 
                      style={{ willChange: 'opacity' }}
                    />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </section>

      <hr className="w-8 mx-auto border-gray-200" />

      {/* 6. 오시는 길 */}
      <section className="py-32 px-6 bg-white">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="text-center"
          style={{ willChange: 'opacity, transform' }}
        >
          <p className="font-eng text-xs tracking-[0.4em] mb-12 text-gray-400 uppercase">Location</p>
          
          <p className="text-lg font-bold text-gray-900 mb-2 tracking-tight">서울대학교 연구공원 웨딩홀</p>
          <a href="tel:02-878-0465" className="inline-block text-[13px] font-medium text-gray-500 mb-8 hover:text-gray-800 transition-colors">
            Tel. 02 878 0465
          </a>
          
          <div className="flex justify-center gap-2 max-w-[320px] mx-auto mb-16">
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

          <div className="text-left max-w-[320px] mx-auto text-[13px] text-gray-600 leading-[1.8] space-y-8">
            <div>
              <p className="font-bold text-gray-800 mb-2 text-[14px]">지하철</p>
              <p className="break-keep">
                2호선 낙성대역 4번 출구 → GS주유소 골목 좌회전 → 마을버스 관악 02-1, 02-2 승차 → 서울대학교후문 하차(21번 정류장) → 길 건너 샛길 연구공원 방향 도보 100m
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 mb-2 text-[14px]">버스</p>
              <p>간선버스(파랑) : 461, 641</p>
              <p>지선버스(초록) : 5413, 5524, 5528</p>
            </div>

            <div>
              <p className="font-bold text-gray-800 mb-2 text-[14px]">자가</p>
              <p className="break-keep mb-1 font-medium text-gray-700">낙성대 입구 서울대 후문 방향이 찾기 수월 (하객주차 2시간 무료)</p>
              <p className="mb-2 text-[#a8a29e] text-[12px]">* 내비게이션 안내 : 서울대연구공원웨딩홀 검색</p>
              <p className="break-keep">
                남부순환도로에서 낙성대 방향 좌회전(강남에서) / 우회전(신림에서) → 서울대 후문 방향 약 1.6km 직진 → 후문 게이트 직진 좌회전 → 샛길로 100m 진입 검은 피라미드 유리건물
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <hr className="w-8 mx-auto border-gray-200" />

      {/* 7. 마음 전하실 곳 */}
      <section className="py-32 px-6 bg-white">
        <motion.p 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
          className="font-eng text-xs tracking-[0.4em] mb-16 text-gray-400 uppercase text-center"
          style={{ willChange: 'opacity, transform' }}
        >
          Mind
        </motion.p>
        
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
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="px-6 pb-2 overflow-hidden">
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

      {/* 연락하기 모달 */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" 
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h3 className="text-[15px] font-bold text-gray-800">연락하기</h3>
                <button onClick={() => setIsContactModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 bg-[#fafafa]">
                {['groom', 'bride'].map((side) => (
                  <div key={side} className="mb-3 last:mb-0 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setContactSection(contactSection === side ? null : side)} 
                      className="w-full px-5 py-4 flex justify-between items-center text-[13px] font-medium text-gray-700"
                    >
                      {contactData[side].title} <ChevronDown size={14} className={`text-gray-300 transition-transform duration-300 ${contactSection === side ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {contactSection === side && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="px-5 pb-2 overflow-hidden">
                          {contactData[side].people.map((person, idx) => (
                            <div key={idx} className="py-4 border-t border-gray-50 flex justify-between items-center last:border-b-0">
                              <div className="flex items-center gap-3">

                                <span className="text-[11px] text-gray-400 w-12 break-keep leading-[1.3]">{person.relation}</span>
                                <span className="text-[14px] text-gray-700 font-medium">{person.name}</span>
                              </div>
                              <a href={`tel:${person.phone}`} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                                <Phone size={14} />
                              </a>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 갤러리 이미지 모달 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setSelectedImage(null)} 
            className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          >
            <button className="absolute top-10 right-10 text-white/40"><X size={28} /></button>
            <motion.img 
              src={selectedImage} 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }} 
              className="max-w-full max-h-[85dvh] object-contain" 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;