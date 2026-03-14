import { motion } from "framer-motion";
import styles from "./Logo.module.css";

const Logo = ({ size = "medium", animate = true, showTagline = false }) => {
  const sizes = {
    small: { hindi: 28, english: 32, gap: 2 },
    medium: { hindi: 48, english: 56, gap: 4 },
    large: { hindi: 72, english: 84, gap: 6 },
  };
  const s = sizes[size];

  return (
    <motion.div
      className={styles.logoWrap}
      initial={animate ? { opacity: 0, scale: 0.8 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className={styles.logoMark}>
        {/* Decorative circle behind */}
        <div className={styles.orb} />

        <div className={styles.logoText} style={{ gap: s.gap }}>
          {/* डॉक in AMS Aakash */}
          <span
            className={styles.hindi}
            style={{ fontSize: s.hindi }}
          >
            डॉक
          </span>

          {/* Sphere in Aglest */}
          <span
            className={styles.english}
            style={{ fontSize: s.english }}
          >
            Sphere
          </span>
        </div>

        {/* Pulse ring */}
        <motion.div
          className={styles.pulseRing}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {showTagline && (
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          स्वास्थ्य · सुलभ · सुरक्षित
        </motion.p>
      )}
    </motion.div>
  );
};

export default Logo;