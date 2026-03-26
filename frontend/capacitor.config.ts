import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.photoevent.app",
  appName: "Photo Event",
  webDir: "public",
  server: {
    // For production: use your deployed frontend URL
    url: "https://photo-event-platform.vercel.app",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
