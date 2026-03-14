import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { sendOTP, verifyOTP, isDummyMode } from "../services/firebase";
import Logo from "../components/Logo";
import VoiceButton from "../components/VoiceButton";
import styles from "./PhoneAuth.module.css";

const NUMPAD = ["1","2","3","4","5","6","7","8","9","←","0","✓"];

export default function PhoneAuth() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lang = state?.lang || { code: "hi-IN", label: "हिंदी" };

  const [step, setStep] = useState("phone"); // phone | otp | verifying | success
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);

  const handleNumpad = (val, isOtp = false) => {
    setError("");
    const current = isOtp ? otp : phone;
    const setter = isOtp ? setOtp : setPhone;
    const maxLen = isOtp ? 6 : 10;

    if (val === "←") { setter(current.slice(0, -1)); return; }
    if (val === "✓") {
      isOtp ? handleVerifyOTP() : handleSendOTP();
      return;
    }
    if (current.length < maxLen) setter(current + val);
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) { setError("10 अंकों का नंबर दर्ज करें"); return; }
    setStep("verifying");
    const result = await sendOTP(`+91${phone}`);
    if (result?.success) {
      setConfirmResult(result.confirmationResult);
      setStep("otp");
    } else {
      setError("OTP भेजने में त्रुटि"); setStep("phone");
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError("6 अंकों का OTP दर्ज करें"); return; }
    setStep("verifying");
    const result = await verifyOTP(otp, confirmResult);
    if (result?.success) {
      setStep("success");
      setTimeout(() => navigate("/vitals", { state: { lang, user: result.user } }), 1200);
    } else {
      setError(result?.message || "OTP गलत है"); setStep("otp");
    }
  };

  const displayPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");

  return (
    <div className={styles.screen}>
      <div className={styles.bgMesh} />
      <div className={styles.bgGrid} />

      <button className={styles.back} onClick={() => navigate("/")}>
        ← वापस
      </button>

      <div className={styles.container}>
        <Logo size="small" animate={false} />

        <AnimatePresence mode="wait">

          {/* ── PHONE STEP ── */}
          {(step === "phone" || step === "verifying") && (
            <motion.div
              key="phone"
              className={styles.card}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <h2 className={styles.title}>मोबाइल नंबर दर्ज करें</h2>
              <p className={styles.sub}>Enter your 10-digit mobile number</p>

              {isDummyMode && (
                <div className={styles.dummyBadge}>
                  🧪 Demo Mode — any number works
                </div>
              )}

              <div className={styles.phoneDisplay}>
                <span className={styles.prefix}>+91</span>
                <span className={styles.phoneNum}>{displayPhone || "—"}</span>
              </div>

              <div className={styles.numpad}>
                {NUMPAD.map((k) => (
                  <motion.button
                    key={k}
                    className={`${styles.key} ${k === "✓" ? styles.confirm : ""} ${k === "←" ? styles.del : ""}`}
                    onClick={() => handleNumpad(k)}
                    whileTap={{ scale: 0.88 }}
                    disabled={step === "verifying"}
                  >
                    {k}
                  </motion.button>
                ))}
              </div>

              <div className={styles.voiceRow}>
                <VoiceButton
                  languageCode={lang.code}
                  label="नंबर बोलें"
                  onTranscript={(t) => {
                    const digits = t.replace(/\D/g, "").slice(0, 10);
                    setPhone(digits);
                  }}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}
            </motion.div>
          )}

          {/* ── OTP STEP ── */}
          {step === "otp" && (
            <motion.div
              key="otp"
              className={styles.card}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <h2 className={styles.title}>OTP दर्ज करें</h2>
              <p className={styles.sub}>+91 {displayPhone} पर भेजा गया</p>

              {isDummyMode && (
                <div className={styles.dummyBadge}>
                  🧪 Demo OTP: <strong>123456</strong>
                </div>
              )}

              <div className={styles.otpBoxes}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.otpBox} ${otp[i] ? styles.filled : ""} ${i === otp.length ? styles.active : ""}`}
                  >
                    {otp[i] || ""}
                  </div>
                ))}
              </div>

              <div className={styles.numpad}>
                {NUMPAD.map((k) => (
                  <motion.button
                    key={k}
                    className={`${styles.key} ${k === "✓" ? styles.confirm : ""} ${k === "←" ? styles.del : ""}`}
                    onClick={() => handleNumpad(k, true)}
                    whileTap={{ scale: 0.88 }}
                  >
                    {k}
                  </motion.button>
                ))}
              </div>

              <button className={styles.resend} onClick={() => { setOtp(""); setStep("phone"); }}>
                OTP दोबारा भेजें
              </button>

              {error && <p className={styles.error}>{error}</p>}
            </motion.div>
          )}

          {/* ── VERIFYING ── */}
          {step === "verifying" && (
            <motion.div key="verify" className={styles.verifyWrap}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.spinRing} />
              <p>जांच हो रही है...</p>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <motion.div key="success" className={styles.successWrap}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className={styles.successCircle}>✓</div>
              <p>स्वागत है!</p>
              <span>Redirecting...</span>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}