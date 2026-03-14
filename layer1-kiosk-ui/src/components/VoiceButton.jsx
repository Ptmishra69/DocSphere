import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { transcribeAudio, startRecording } from "../services/sarvam";
import styles from "./VoiceButton.module.css";

const VoiceButton = ({ onTranscript, languageCode = "hi-IN", label = "बोलें" }) => {
  const [state, setState] = useState("idle"); // idle | recording | processing | done
  const recorderRef = useRef(null);

  const handlePress = async () => {
    if (state === "recording") {
      // Stop recording
      setState("processing");
      try {
        const blob = await recorderRef.current.stop();
        const result = await transcribeAudio(blob, languageCode);
        if (result.success) {
          onTranscript?.(result.transcript);
          setState("done");
          setTimeout(() => setState("idle"), 2000);
        } else {
          setState("idle");
        }
      } catch {
        setState("idle");
      }
      return;
    }

    // Start recording
    try {
      const rec = await startRecording();
      recorderRef.current = rec;
      rec.start();
      setState("recording");
    } catch {
      alert("Microphone permission denied");
      setState("idle");
    }
  };

  return (
    <div className={styles.wrap}>
      <motion.button
        className={`${styles.btn} ${styles[state]}`}
        onPointerDown={handlePress}
        whileTap={{ scale: 0.93 }}
      >
        {/* Wave bars shown while recording */}
        <AnimatePresence mode="wait">
          {state === "recording" ? (
            <motion.div
              key="waves"
              className={styles.waves}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                <motion.span
                  key={i}
                  className={styles.bar}
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay }}
                />
              ))}
            </motion.div>
          ) : state === "processing" ? (
            <motion.div
              key="spinner"
              className={styles.spinner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.2 } }}
            />
          ) : (
            <motion.svg
              key="mic"
              width="28" height="28" viewBox="0 0 24 24" fill="none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
              <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <span className={styles.label}>
        {state === "idle" && label}
        {state === "recording" && "रुकने के लिए दबाएं"}
        {state === "processing" && "सुन रहे हैं..."}
        {state === "done" && "✓ सुना"}
      </span>
    </div>
  );
};

export default VoiceButton;