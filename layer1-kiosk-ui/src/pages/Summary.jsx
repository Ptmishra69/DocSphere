import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import styles from "./Summary.module.css";

export default function Summary() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { patient, lang } = state || {};

  if (!patient) {
    navigate("/");
    return null;
  }

  const criticalFlags = patient.flags.filter((f) => f.severity === "critical");
  const highFlags = patient.flags.filter((f) => f.severity === "high");

  return (
    <div className={styles.screen}>
      <div className={styles.bgMesh} />
      <div className={styles.bgGrid} />

      <div className={styles.header}>
        <Logo size="small" animate={false} />
        <div className={styles.headerRight}>
          <span className={styles.patientId}>{patient.id}</span>
          <span className={styles.timestamp}>
            {new Date(patient.timestamp).toLocaleTimeString("hi-IN")}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <motion.div
          className={styles.summaryCard}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.summaryHeader}>
            <div>
              <h2 className={styles.patientName}>{patient.name}</h2>
              <p className={styles.patientMeta}>
                {patient.age} वर्ष · {patient.gender === "male" ? "पुरुष" : "महिला"} ·
                रक्त समूह: {patient.bloodGroup} · {patient.city}
              </p>
              {patient.existingCondition !== "None" && (
                <p className={styles.condition}>
                  पूर्व बीमारी: {patient.existingCondition}
                </p>
              )}
            </div>

            <div className={styles.overallStatus}>
              {patient.flags.length === 0 ? (
                <div className={styles.statusNormal}>
                  <span>✓</span>
                  <p>सामान्य</p>
                </div>
              ) : criticalFlags.length > 0 ? (
                <div className={styles.statusCritical}>
                  <span>!</span>
                  <p>गंभीर</p>
                </div>
              ) : (
                <div className={styles.statusWarning}>
                  <span>⚠</span>
                  <p>ध्यान दें</p>
                </div>
              )}
            </div>
          </div>

          {patient.flags.length > 0 && (
            <div className={styles.flagSection}>
              <h3>असामान्य रीडिंग</h3>
              <div className={styles.flagList}>
                {patient.flags.map((flag, i) => (
                  <motion.div
                    key={i}
                    className={`${styles.flagItem} ${styles[flag.severity]}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <span>{flag.param}</span>
                    <strong>{flag.value}</strong>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.vitalsRow}>
            {[
              { key: "heart_rate", label: "HR", v: patient.vitals.heart_rate },
              { key: "spo2", label: "SpO₂", v: patient.vitals.spo2 },
              { key: "bp_systolic", label: "BP", v: { value: `${patient.vitals.bp_systolic.value}/${patient.vitals.bp_diastolic.value}`, unit: "mmHg", normal: [1,1] } },
              { key: "temperature", label: "Temp", v: patient.vitals.temperature },
              { key: "glucose", label: "Glucose", v: patient.vitals.glucose },
              { key: "bmi", label: "BMI", v: patient.vitals.bmi },
            ].map(({ key, label, v }) => (
              <div key={key} className={styles.miniVital}>
                <span className={styles.miniLabel}>{label}</span>
                <span className={styles.miniVal}>{v.value}</span>
                <span className={styles.miniUnit}>{v.unit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button className={styles.btnSecondary} onClick={() => navigate("/vitals", { state: { lang } })}>
            ← दोबारा स्कैन करें
          </button>

          <button className={styles.btnPrimary}>
            <span>AI डॉक्टर को भेजें</span>
            <span className={styles.btnSub}>Layer 3 Pipeline →</span>
          </button>
        </motion.div>

        <p className={styles.disclaimer}>
          ⚠ यह डेटा synthetic है · AI सुझाव, डॉक्टर की राय नहीं · Prototype v1.0
        </p>
      </div>
    </div>
  );
}