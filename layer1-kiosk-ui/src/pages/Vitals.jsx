import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { generateSyntheticPatient, getVitalStatus } from "../data/SyntheticPatient";
import Logo from "../components/Logo";
import styles from "./Vitals.module.css";

const VITAL_LABELS = {
  heart_rate:    { label: "हृदय गति", en: "Heart Rate", icon: "♥" },
  spo2:          { label: "SpO₂", en: "Blood Oxygen", icon: "○" },
  bp_systolic:   { label: "BP (ऊपर)", en: "BP Systolic", icon: "↑" },
  bp_diastolic:  { label: "BP (नीचे)", en: "BP Diastolic", icon: "↓" },
  temperature:   { label: "तापमान", en: "Temperature", icon: "◈" },
  glucose:       { label: "ग्लूकोज", en: "Blood Glucose", icon: "◇" },
  weight:        { label: "वज़न", en: "Weight", icon: "⊕" },
  bmi:           { label: "BMI", en: "BMI", icon: "≡" },
};

const SCAN_STEPS = [
  "सेंसर कनेक्ट हो रहे हैं...",
  "डेटा संग्रह हो रहा है...",
  "विश्लेषण चल रहा है...",
  "रिपोर्ट तैयार हो रही है...",
];

export default function Vitals() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lang = state?.lang || { code: "hi-IN" };

  const [scanPhase, setScanPhase] = useState("ready"); // ready | scanning | done
  const [stepIdx, setStepIdx] = useState(0);
  const [patient, setPatient] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState([]);

  const startScan = () => {
    setScanPhase("scanning");
    const p = generateSyntheticPatient();

    // Progress through scan steps
    let s = 0;
    const stepTimer = setInterval(() => {
      s++;
      setStepIdx(s);
      if (s >= SCAN_STEPS.length - 1) clearInterval(stepTimer);
    }, 900);

    // Show results after scan completes
    setTimeout(() => {
      setPatient(p);
      setScanPhase("done");
      // Reveal vitals one by one
      const keys = Object.keys(p.vitals);
      keys.forEach((k, i) => {
        setTimeout(() => setRevealedKeys((prev) => [...prev, k]), i * 180);
      });
    }, 3800);
  };

  const handleProceed = () => {
    navigate("/summary", { state: { lang, patient } });
  };

  const statusColor = {
    normal: styles.normal,
    high: styles.high,
    low: styles.low,
  };

  return (
    <div className={styles.screen}>
      <div className={styles.bgMesh} />
      <div className={styles.bgGrid} />

      <div className={styles.header}>
        <Logo size="small" animate={false} />
        {state?.user && (
          <div className={styles.userBadge}>
            📱 +91 {state.user.phone?.replace("+91", "") || "XXXXXXXXXX"}
          </div>
        )}
      </div>

      <div className={styles.body}>

        {/* ── READY STATE ── */}
        {scanPhase === "ready" && (
          <motion.div
            className={styles.readyWrap}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.scanCircle}>
              <motion.div
                className={styles.scanPulse}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M8 32h6m36 0h6M32 8v6m0 36v6" stroke="#88C9CA" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="32" cy="32" r="12" stroke="#88C9CA" strokeWidth="2"/>
                <circle cx="32" cy="32" r="4" fill="#DCFC92"/>
              </svg>
            </div>
            <h2 className={styles.readyTitle}>जांच शुरू करें</h2>
            <p className={styles.readySub}>
              स्वास्थ्य डेटा संग्रह के लिए नीचे बटन दबाएं<br/>
              <span>(Synthetic data — prototype mode)</span>
            </p>
            <motion.button
              className={styles.startBtn}
              onClick={startScan}
              whileTap={{ scale: 0.95 }}
              animate={{ boxShadow: ["0 0 20px rgba(220,252,146,0.3)", "0 0 40px rgba(220,252,146,0.6)", "0 0 20px rgba(220,252,146,0.3)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              स्कैन शुरू करें · Start Scan
            </motion.button>
          </motion.div>
        )}

        {/* ── SCANNING STATE ── */}
        {scanPhase === "scanning" && (
          <motion.div
            className={styles.scanningWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.radarWrap}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={styles.radarRing}
                  animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.65, ease: "easeOut" }}
                />
              ))}
              <div className={styles.radarCore}>
                <motion.div
                  className={styles.radarSweep}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={stepIdx}
                className={styles.scanStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {SCAN_STEPS[Math.min(stepIdx, SCAN_STEPS.length - 1)]}
              </motion.p>
            </AnimatePresence>

            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                animate={{ width: `${((stepIdx + 1) / SCAN_STEPS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* ── RESULTS STATE ── */}
        {scanPhase === "done" && patient && (
          <motion.div
            className={styles.resultsWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.patientCard}>
              <div className={styles.patientInfo}>
                <span className={styles.patientName}>{patient.name}</span>
                <span className={styles.patientMeta}>
                  {patient.age} वर्ष · {patient.gender === "male" ? "पुरुष" : "महिला"} · {patient.bloodGroup} · {patient.city}
                </span>
              </div>
              {patient.flags.length > 0 && (
                <div className={styles.flagAlert}>
                  ⚠ {patient.flags.length} असामान्य रीडिंग
                </div>
              )}
            </div>

            <div className={styles.vitalsGrid}>
              {Object.entries(patient.vitals).map(([key, vital]) => {
                const meta = VITAL_LABELS[key];
                if (!meta) return null;
                const status = getVitalStatus(vital);
                const shown = revealedKeys.includes(key);
                return (
                  <motion.div
                    key={key}
                    className={`${styles.vitalCard} ${statusColor[status]}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <span className={styles.vitalIcon}>{meta.icon}</span>
                    <div className={styles.vitalValue}>
                      {vital.value}
                      <span className={styles.vitalUnit}>{vital.unit}</span>
                    </div>
                    <div className={styles.vitalLabel}>{meta.label}</div>
                    <div className={styles.vitalStatus}>
                      {status === "normal" ? "सामान्य" : status === "high" ? "अधिक ▲" : "कम ▼"}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              className={styles.proceedBtn}
              onClick={handleProceed}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              whileTap={{ scale: 0.96 }}
            >
              AI विश्लेषण के लिए आगे बढ़ें →
            </motion.button>
          </motion.div>
        )}

      </div>
    </div>
  );
}