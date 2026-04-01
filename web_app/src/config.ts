// Welding AI Configuration
// For Mobile (APK) deployment, your backend must be reachable via a public URL or your local network IP.
// Tip: If using a real device, use your PC's local IP (e.g., 192.168.1.XX)

const IS_DEV = import.meta.env.DEV;
const LOCAL_IP = '172.17.93.183'; // Adjusted for your local network IP

export const API_BASE = IS_DEV 
    ? `http://${window.location.hostname}:8000` 
    : `http://${LOCAL_IP}:8000`;
