import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import styles from "./Welcome.module.css";

const LANGUAGE_OPTIONS = [
  { code: "hi-IN", label: "हिंदी", sub: "Hindi" },
  { code: "en-IN", label: "English", sub: "English" },
  { code: "bn-IN", label: "বাংলা", sub: "Bengali" },
  { code: "te-IN", label: "తెలుగు", sub: "Telugu" },
  { code: "ta-IN", label: "தமிழ்", sub: "Tamil" },
  { code: "mr-IN", label: "मराठी", sub: "Marathi" },
  { code: "gu-IN", label: "ગુજરાતી", sub: "Gujarati" },
  { code: "kn-IN", label: "ಕನ್ನಡ", sub: "Kannada" },
];

const IDLE_TEXTS = [
  { main: "आपका स्वागत है", sub: "स्वास्थ्य जांच शुरू करने के लिए छुएं" },
  { main: "Welcome", sub: "Touch to begin your health checkup" },
  { main: "आपले स्वागत आहे", sub: "आरोग्य तपासणीसाठी स्पर्श करा" },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [langSelected, setLangSelected] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [idleIdx, setIdleIdx] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setIdleIdx((i) => (i + 1) % IDLE_TEXTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLangSelect = (lang) => {
    setSelectedLang(lang);
    setLangSelected(true);
    setTimeout(() => navigate("/phone", { state: { lang } }), 700);
  };

  const formatTime = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d) =>
    d.toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className={styles.screen}>
      {/* Animated background mesh */}
      <div className={styles.bgMesh} />
      <div className={styles.bgGrid} />

      {/* Scanline effect */}
      <div className={styles.scanline} />

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.clock}>{formatTime(time)}</span>
          <span className={styles.dateStr}>{formatDate(time)}</span>
        </div>
        <div className={styles.topRight}>
          <span className={styles.badge}>🟢 LIVE</span>
          <span className={styles.location}>📍 Greater Noida</span>
        </div>
      </div>

      {/* Center content */}
      <div className={styles.center}>
        {!langSelected ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Logo size="large" animate showTagline />
            </motion.div>

            <motion.div
              className={styles.idleText}
              key={idleIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className={styles.mainText}>{IDLE_TEXTS[idleIdx].main}</h1>
              <p className={styles.subText}>{IDLE_TEXTS[idleIdx].sub}</p>
            </motion.div>

            {/* Language selection */}
            <motion.div
              className={styles.langSection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className={styles.langPrompt}>अपनी भाषा चुनें · Choose your language</p>
              <div className={styles.langGrid}>
                {LANGUAGE_OPTIONS.map((lang, i) => (
                  <motion.button
                    key={lang.code}
                    className={styles.langBtn}
                    onClick={() => handleLangSelect(lang)}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    whileTap={{ scale: 0.93 }}
                    whileHover={{ scale: 1.04 }}
                  >
                    <span className={styles.langLabel}>{lang.label}</span>
                    <span className={styles.langSub}>{lang.sub}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            className={styles.langConfirm}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className={styles.checkCircle}>✓</div>
            <p>{selectedLang?.label} चुना गया</p>
          </motion.div>
        )}
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <span>₹50 प्रति जांच · ₹50 per visit</span>
        <span className={styles.dot}>·</span>
        <span>AI-powered · Doctor Approved</span>
        <span className={styles.dot}>·</span>
        <span>Innovate Bharat 2026</span>
      </div>
    </div>
  );
}