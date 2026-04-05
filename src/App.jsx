import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, ChevronDown } from 'lucide-react';

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

  const copyToClipboard = (text, message = '계좌번호가 복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: '김철수 & 이영희 결혼합니다',
      text: '2026년 10월 24일 토요일 오후 1시\n서울 팰리스 호텔',
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('공유 취소'); }
    } else {
      copyToClipboard(window.location.href, '청첩장 주소가 복사되었습니다.');
    }
  };

  const galleryImages = [
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1583939000340-690624197171?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=400"
  ];

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl font-serif text-gray-800 overflow-hidden relative pb-20">
      
      <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center" animate={{ scale: [1, 1.15] }} transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }} />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div className="relative z-10 text-center text-white mt-auto mb-24" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.p variants={fadeUp} className="font-eng text-sm tracking-[0.3em] mb-4 text-white/90">THE WEDDING DAY</motion.p>
          <motion.h1 variants={fadeUp} className="font-eng text-5xl mb-6 font-semibold drop-shadow-lg">Chulsoo & Younghee</motion.h1>
          <motion.p variants={fadeUp} className="text-lg font-light tracking-widest">2026. 10. 24. SAT 13:00</motion.p>
        </motion.div>
      </section>

      <section className="py-32 px-8 text-center bg-[#fafaf9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <p className="font-eng text-xs tracking-widest text-[#a8a29e] mb-10">INVITATION</p>
          <p className="text-gray-600 leading-[2.4] text-[15px] font-light">서로가 마주 보며 다져온 사랑을<br />이제 함께 한 곳을 바라보며<br />걸어갈 수 있는 큰 사랑으로 키우고자 합니다.<br /><br />저희 두 사람이 믿음과 사랑으로<br />한 가정을 이루는 뜻깊은 자리에<br />소중한 분들을 모시고자 합니다.</p>
        </motion.div>
      </section>

      <section className="py-24 px-6 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
          <motion.p variants={fadeUp} className="font-eng text-xl tracking-widest text-gray-800 mb-12">GALLERY</motion.p>
          <div className="grid grid-cols-2 gap-3">
            {galleryImages.map((src, index) => (
              <motion.div key={index} variants={fadeUp} whileHover={{ scale: 0.98 }} className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-sm">
                <img src={src} alt="wedding" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-24 px-6 bg-[#fafaf9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="font-eng text-xl tracking-widest text-gray-800 mb-8">LOCATION</p>
          <p className="text-lg font-bold text-gray-800 mb-2">서울 팰리스 호텔 그랜드볼룸</p>
          <p className="text-sm text-gray-500 mb-10">서울 강남구 테헤란로 123</p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            <a href="https://map.naver.com/v5/search/서울 팰리스 호텔" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-[#03C75A] rounded-full flex items-center justify-center mb-2 text-white font-bold text-xs">N</div>
              <span className="text-[11px] font-semibold text-gray-600">네이버지도</span>
            </a>
            <a href="https://map.kakao.com/link/search/서울 팰리스 호텔" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-[#FEE500] rounded-full flex items-center justify-center mb-2 text-[#191919] font-bold text-xs">K</div>
              <span className="text-[11px] font-semibold text-gray-600">카카오맵</span>
            </a>
            <a href="tmap://search?name=서울 팰리스 호텔" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-[#000000] rounded-full flex items-center justify-center mb-2 text-white font-bold text-xs">T</div>
              <span className="text-[11px] font-semibold text-gray-600">티맵</span>
            </a>
          </div>
        </motion.div>
      </section>

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
                    <div><p className="text-xs text-gray-500 mb-1">국민은행</p><p className="text-sm font-medium">123-456-7890 <span className="text-xs text-gray-400 ml-1">김철수</span></p></div>
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
                    <div><p className="text-xs text-gray-500 mb-1">신한은행</p><p className="text-sm font-medium">098-765-4321 <span className="text-xs text-gray-400 ml-1">이영희</span></p></div>
                    <button onClick={() => copyToClipboard('0987654321')} className="p-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-600"><Copy size={16} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-gradient-to-t from-white via-white/90 to-transparent z-50">
        <button onClick={handleNativeShare} className="w-full py-4 bg-gray-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-gray-700 transition">
          <Share2 size={18} /> 초대장 링크 공유하기
        </button>
      </div>

    </div>
  );
}

export default App;