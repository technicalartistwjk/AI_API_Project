import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ChevronDown, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// 🌟 [중요] src/assets 폴더 안의 로컬 이미지를 불러옵니다.
// 확장자가 .jpg가 아니라 .png나 .webp라면 아래 경로를 수정해주세요!
import mainImage from './assets/main.jpg';
import sub0 from './assets/sub0.jpg';
import sub1 from './assets/sub1.jpg';
import sub2 from './assets/sub2.jpg';
import sub3 from './assets/sub3.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

function App() {
  const [openAccount, setOpenAccount] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const copyToClipboard = (text, message = '계좌번호가 복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  // 🌟 불러온 갤러리 이미지들을 배열로 만듭니다. (순서대로 1~4번)
  const galleryImages = [sub0, sub1, sub2, sub3];

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl font-serif text-gray-800 overflow-hidden relative">
      
      {/* 1. 메인 히어로 */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        {/* 🌟 Tailwind의 bg-[url()] 대신 inline style로 불러온 이미지를 적용합니다. */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${mainImage})` }}
          animate={{ scale: [1, 1.15] }} 
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }} 
        />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div className="relative z-10 text-center text-white mt-auto mb-24" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.p variants={fadeUp} className="font-eng text-sm tracking-[0.3em] mb-4 text-white/90">THE WEDDING DAY</motion.p>
          <motion.h1 variants={fadeUp} className="font-eng text-5xl mb-6 font-semibold drop-shadow-lg text-white">Woojinkyu & Leejiyoung</motion.h1>
          <motion.p variants={fadeUp} className="text-lg font-light tracking-widest text-white">2026. 05. 16. SAT 18:30</motion.p>
        </motion.div>
      </section>

      {/* 2. 초대글 */}
      <section className="py-32 px-8 text-center bg-[#fafaf9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <p className="font-eng text-xs tracking-widest text-[#a8a29e] mb-10">INVITATION</p>
          <h3 className="text-xl font-bold mb-10 text-gray-800">초대합니다</h3>
          <p className="text-gray-600 leading-[2.4] text-[15px] font-light">
            서로가 마주 보며 다져온 사랑을<br />이제 함께 한 곳을 바라보며<br />걸어갈 수 있는 큰 사랑으로 키우고자 합니다.<br /><br />
            저희 두 사람이 믿음과 사랑으로<br />한 가정을 이루는 뜻깊은 자리에<br />소중한 분들을 모시고자 합니다.
          </p>
        </motion.div>
      </section>

      {/* 3. 스와이프 갤러리 */}
      <section className="py-24 bg-white overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <motion.p variants={fadeUp} className="font-eng text-center text-xl tracking-widest text-gray-800 mb-2">GALLERY</motion.p>
          <motion.p variants={fadeUp} className="text-center text-xs text-gray-400 mb-8">좌우로 밀어서 사진을 확인해 보세요</motion.p>
          
          <div className="px-4">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{ rotate: 20, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
              pagination={true}
              modules={[EffectCoverflow, Pagination]}
              className="w-full py-10"
            >
              {galleryImages.map((src, index) => (
                <SwiperSlide key={index} className="w-[280px] h-[380px] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  {/* 🌟 로컬 이미지가 적용됩니다. */}
                  <img src={src} alt={`wedding-${index}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setSelectedImage(src)} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </motion.div>
      </section>

      {/* 4. 오시는 길 */}
      <section className="py-24 px-6 bg-[#fafaf9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="font-eng text-xl tracking-widest text-gray-800 mb-8">LOCATION</p>
          <p className="text-lg font-bold text-gray-800 mb-2">서울대학교 연구공원 웨딩홀</p>
          <p className="text-sm text-gray-500 mb-10 text-center">서울특별시 관악구 낙성대로 38<br/>(낙성대동 1622-4)</p>
          
          <div className="grid grid-cols-3 gap-4">
            <a href="https://map.naver.com/v5/search/서울대학교연구공원웨딩홀" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-[10px] font-bold text-gray-500">
                <span className="text-[#03C75A] text-lg mb-1 font-black">N</span>네이버
            </a>
            <a href="https://map.kakao.com/link/search/서울대학교연구공원웨딩홀" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-[10px] font-bold text-gray-500">
                <span className="text-[#FEE500] text-lg mb-1 font-black">K</span>카카오
            </a>
            <a href="tmap://search?name=서울대학교연구공원웨딩홀" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-[10px] font-bold text-gray-500">
                <span className="text-black text-lg mb-1 font-black">T</span>티맵
            </a>
          </div>
        </motion.div>
      </section>

      {/* 5. 마음 전하실 곳 */}
      <section className="py-24 px-6 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="font-eng text-center text-xl tracking-widest text-gray-800 mb-10">MIND</p>
          
          <div className="mb-4 bg-[#fafaf9] rounded-2xl overflow-hidden border border-gray-100">
            <button onClick={() => setOpenAccount(openAccount === 'groom' ? null : 'groom')} className="w-full px-6 py-5 flex justify-between items-center text-sm font-bold text-gray-700">
              신랑측 계좌번호 <motion.div animate={{ rotate: openAccount === 'groom' ? 180 : 0 }}><ChevronDown size={18} className="text-gray-400" /></motion.div>
            </button>
            <AnimatePresence>
              {openAccount === 'groom' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-5">
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div><p className="text-xs text-gray-500 mb-1">국민은행</p><p className="text-sm font-medium">123-456-7890 <span className="text-xs text-gray-400 ml-1">우진규</span></p></div>
                    <button onClick={() => copyToClipboard('1234567890')} className="p-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-600"><Copy size={16} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#fafaf9] rounded-2xl overflow-hidden border border-gray-100">
            <button onClick={() => setOpenAccount(openAccount === 'bride' ? null : 'bride')} className="w-full px-6 py-5 flex justify-between items-center text-sm font-bold text-gray-700">
              신부측 계좌번호 <motion.div animate={{ rotate: openAccount === 'bride' ? 180 : 0 }}><ChevronDown size={18} className="text-gray-400" /></motion.div>
            </button>
            <AnimatePresence>
              {openAccount === 'bride' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-5">
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div><p className="text-xs text-gray-500 mb-1">신한은행</p><p className="text-sm font-medium">098-765-4321 <span className="text-xs text-gray-400 ml-1">이지영</span></p></div>
                    <button onClick={() => copyToClipboard('0987654321')} className="p-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-600"><Copy size={16} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* 푸터 */}
      <footer className="bg-[#1c1917] text-gray-400 text-center py-16 px-6 font-eng relative">
        <p className="text-sm tracking-widest text-white/80 uppercase">Woojinkyu & Leejiyoung</p>
      </footer>

      {/* 모달 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer">
            <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white"><X size={24} /></button>
            {/* 🌟 모달에서도 로컬 이미지가 크게 보입니다. */}
            <motion.img src={selectedImage} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;