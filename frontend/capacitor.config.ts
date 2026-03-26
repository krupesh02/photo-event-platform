import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.photoevent.app",
  appName: "Photo Event",
  webDir: "public",
  server: {
    // For development: use your computer's local IP
    // url: "http://192.168.1.X:3000",
    // For production: use your deployed frontend URL
    url: "http://localhost:3000",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
