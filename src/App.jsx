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
import sub0 from './assets/sub0.jpg';
import sub0Full from './assets/sub0_full.jpg';
import sub1 from './assets/sub1.jpg';
import sub1Full from './assets/sub1_full.jpg';
import sub2 from './assets/sub2.jpg';
import sub2Full from './assets/sub2_full.jpg';
import sub3 from './assets/sub3.jpg';
import sub3Full from './assets/sub3_full.jpg';
import bgmFile from './assets/bgm.mp3';

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
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSection, setContactSection] = useState(null);

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

  const contactData = {
    groom: {
      title: "신랑측 연락처",
      people: [
        { relation: "신랑", name: "우진규", phone: "010-1234-5678" },
        { relation: "아버지", name: "우승호", phone: "010-0000-0000" },
        { relation: "어머니", name: "신미순", phone: "010-0000-0000" },
      ]
    },
    bride: {
      title: "신부측 연락처",
      people: [
        { relation: "신부", name: "이지영", phone: "010-9876-5432" },
        { relation: "아버지", name: "이준희", phone: "010-0000-0000" },
        { relation: "어머니", name: "이미례", phone: "010-0000-0000" },
      ]
    }
  };

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl font-serif text-gray-800 overflow-hidden relative">
      
      <audio ref={audioRef} src={bgmFile} loop autoPlay />

      <button 
        onClick={togglePlay}
        className="fixed bottom-8 right-6 z-[90] p-3.5 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-600 transition-transform active:scale-90"
        aria-label="Toggle Music"
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* 1. 메인 히어로 */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mainImage})` }} />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div 
          className="relative z-10 text-center text-white mt-auto mb-24 px-4"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="font-eng text-[11px] tracking-[0.5em] mb-8 text-white/90 uppercase text-center">
            The Wedding Day
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-eng text-4xl font-semibold tracking-widest text-white uppercase text-center leading-[1.6]">
            Woojinkyu<br />
            Leejiyoung
          </motion.h1>
        </motion.div>
      </section>

      {/* 2. D-day */}
      <section className="pt-24 pb-16 px-6 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="text-gray-400 mb-6 text-[10px] font-medium tracking-[0.3em] uppercase">Days until our wedding day</p>
          <div className="flex justify-center items-end gap-2 font-eng">
            <span className="text-5xl font-bold text-gray-900 tabular-nums tracking-tighter">D-{dDay}</span>
          </div>
        </motion.div>
      </section>

      {/* 🌟 3. 캘린더 달력 섹션 (신규 추가) */}
      <section className="pb-32 px-8 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="font-eng text-2xl text-gray-700 mb-3 tracking-widest">2026.05.16</p>
          <p className="text-[13px] text-gray-500 mb-12 font-medium">토요일 오후 6시 30분</p>

          {/* 캘린더 그리드 */}
          <div className="max-w-[280px] mx-auto text-[13px] text-gray-600">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-y-6 mb-5 font-medium text-gray-400">
              <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
            </div>
            {/* 날짜들 (2026년 5월 기준 달력 배열) */}
            <div className="grid grid-cols-7 gap-y-6 items-center justify-items-center">
              <span></span><span></span><span></span><span></span><span></span>
              <span>1</span><span>2</span>
              <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
              
              {/* 🌟 16일 강조 포인트 */}
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
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          
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

      {/* 5. 갤러리 */}
      <section className="py-28 bg-white">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-eng text-center text-xs tracking-[0.4em] mb-16 text-gray-400 uppercase">Gallery</motion.p>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{ rotate: 0, stretch: 50, depth: 150, modifier: 1, slideShadows: false }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="pb-12"
        >
          {galleryData.map((img, index) => (
            <SwiperSlide key={index} className="w-[300px] aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden shadow-md relative">
              {({ isActive }) => (
                <div className="w-full h-full relative cursor-pointer" onClick={() => setSelectedIndex(index)}>
                  <img src={img.thumb} loading="lazy" alt="wedding" className="w-full h-full object-cover" />
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

      {/* 6. 오시는 길 */}
      <section className="py-32 px-6 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
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

      {/* 연락하기 모달 */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
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
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-5 pb-2 overflow-hidden">
                          {contactData[side].people.map((person, idx) => (
                            <div key={idx} className="py-4 border-t border-gray-50 flex justify-between items-center last:border-b-0">
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-gray-400 w-10">{person.relation}</span>
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
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setSelectedIndex(null)} 
            className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
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