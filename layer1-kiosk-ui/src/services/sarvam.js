// Sarvam AI - Speech to Text Service
// Supports 10 Indian languages
// API Docs: https://docs.sarvam.ai/api-reference-docs/speech-to-text

const SARVAM_API_KEY = import.meta.env.sk_i21yrkfn_FF3XekUYgQUoEKHGEsJQWEBo;
const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";

export const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", label: "हिंदी", name: "Hindi", flag: "🇮🇳" },
  { code: "en-IN", label: "English", name: "English", flag: "🇮🇳" },
  { code: "bn-IN", label: "বাংলা", name: "Bengali", flag: "🇮🇳" },
  { code: "te-IN", label: "తెలుగు", name: "Telugu", flag: "🇮🇳" },
  { code: "ta-IN", label: "தமிழ்", name: "Tamil", flag: "🇮🇳" },
  { code: "mr-IN", label: "मराठी", name: "Marathi", flag: "🇮🇳" },
  { code: "gu-IN", label: "ગુજરાતી", name: "Gujarati", flag: "🇮🇳" },
  { code: "kn-IN", label: "ಕನ್ನಡ", name: "Kannada", flag: "🇮🇳" },
  { code: "ml-IN", label: "മലയാളം", name: "Malayalam", flag: "🇮🇳" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ", name: "Punjabi", flag: "🇮🇳" },
];

export const transcribeAudio = async (audioBlob, languageCode = "hi-IN") => {
  if (!SARVAM_API_KEY) {
    console.warn("[SARVAM] No API key — using dummy transcript");
    return { success: true, transcript: "डमी ट्रांसक्रिप्ट", language: languageCode };
  }

  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    formData.append("language_code", languageCode);
    formData.append("model", "saarika:v2");
    formData.append("with_timestamps", "false");

    const response = await fetch(SARVAM_STT_URL, {
      method: "POST",
      headers: { "api-subscription-key": SARVAM_API_KEY },
      body: formData,
    });

    if (!response.ok) throw new Error(`Sarvam API error: ${response.status}`);
    const data = await response.json();
    return { success: true, transcript: data.transcript, language: languageCode };
  } catch (err) {
    console.error("[SARVAM STT error]", err);
    return { success: false, error: err.message };
  }
};

// Browser MediaRecorder helper — starts mic recording
export const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  const chunks = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);

  return {
    recorder,
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: "audio/webm" }));
        };
        recorder.stop();
      }),
    start: () => recorder.start(),
  };
};