// Firebase dummy config — replace with real keys from Firebase Console
// when ready: https://console.firebase.google.com

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "DUMMY_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "docsphere-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "docsphere-demo",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "DUMMY_APP_ID",
};

// ─── DUMMY OTP SERVICE (active until real Firebase keys are added) ─────────
// Simulates OTP send/verify flow with a fixed OTP: 123456
// Replace isDummy = false once Firebase Phone Auth is configured

const isDummy = !import.meta.env.VITE_FIREBASE_API_KEY;

let dummyOtpStore = null;

export const sendOTP = async (phoneNumber) => {
  if (isDummy) {
    console.warn("[DUMMY] OTP sent to", phoneNumber, "— use 123456");
    dummyOtpStore = { phone: phoneNumber, otp: "123456", ts: Date.now() };
    return { success: true, message: "OTP sent (dummy mode)", confirmationResult: "dummy" };
  }

  // Real Firebase Phone Auth — uncomment when keys are ready
  /*
  const { initializeApp } = await import("firebase/app");
  const { getAuth, signInWithPhoneNumber, RecaptchaVerifier } = await import("firebase/auth");
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
  window.confirmationResult = confirmationResult;
  return { success: true, confirmationResult };
  */
};

export const verifyOTP = async (otp, confirmationResult) => {
  if (isDummy) {
    const expired = Date.now() - dummyOtpStore?.ts > 5 * 60 * 1000;
    if (expired) return { success: false, message: "OTP expired" };
    if (otp === dummyOtpStore?.otp) {
      return { success: true, user: { phone: dummyOtpStore.phone, uid: "dummy-uid-" + Date.now() } };
    }
    return { success: false, message: "Invalid OTP" };
  }

  // Real Firebase verify
  /*
  const result = await window.confirmationResult.confirm(otp);
  return { success: true, user: result.user };
  */
};

export const isDummyMode = isDummy;