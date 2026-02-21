import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff } from "lucide-react";

interface NotificationSettingsProps {
  iftorlikTime: string;
  saharlikTime: string;
}

const NotificationSettings = ({ iftorlikTime, saharlikTime }: NotificationSettingsProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const [lastNotified, setLastNotified] = useState<string>("");

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      setEnabled(Notification.permission === "granted" && localStorage.getItem("ramadan-notif") === "true");
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setEnabled(true);
      localStorage.setItem("ramadan-notif", "true");
      new Notification("Ramazon Taqvimi 🌙", {
        body: `Bildirishnomalar yoqildi! Saharlik: ${saharlikTime}, Iftorlik: ${iftorlikTime}`,
        icon: "/favicon.ico",
      });
    }
  };

  const toggleNotifications = () => {
    if (enabled) {
      setEnabled(false);
      localStorage.setItem("ramadan-notif", "false");
    } else if (permission === "granted") {
      setEnabled(true);
      localStorage.setItem("ramadan-notif", "true");
      new Notification("Ramazon Taqvimi 🌙", {
        body: `Bildirishnomalar yoqildi! Saharlik: ${saharlikTime}, Iftorlik: ${iftorlikTime}`,
        icon: "/favicon.ico",
      });
    } else {
      requestPermission();
    }
  };

  const sendNotification = useCallback((title: string, body: string) => {
    const key = `${title}-${new Date().toDateString()}`;
    if (lastNotified === key) return;
    setLastNotified(key);
    new Notification(title, { body, icon: "/favicon.ico" });
  }, [lastNotified]);

  // Check every 30 seconds for prayer time alerts
  useEffect(() => {
    if (!enabled || !isSupported) return;

    const checkTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

      // Parse saharlik time and create 15-min warning
      const [sH, sM] = saharlikTime.split(":").map(Number);
      let warnH = sH;
      let warnM = sM - 15;
      if (warnM < 0) { warnM += 60; warnH -= 1; }
      const warnTime = `${String(warnH).padStart(2, "0")}:${String(warnM).padStart(2, "0")}`;

      if (currentTime === warnTime) {
        sendNotification("⏰ Saharlikka 15 daqiqa qoldi!", `Saharlik vaqti: ${saharlikTime}`);
      }

      if (currentTime === saharlikTime) {
        sendNotification("🌅 Saharlik vaqti!", "Og'iz yopish vaqti keldi. Niyat qiling!");
      }

      if (currentTime === iftorlikTime) {
        sendNotification("🌙 Iftorlik vaqti keldi!", "Og'iz ochish vaqti. Ramazon Muborak!");
      }

      // 15 min before iftar
      const [iH, iM] = iftorlikTime.split(":").map(Number);
      let iftarWarnH = iH;
      let iftarWarnM = iM - 15;
      if (iftarWarnM < 0) { iftarWarnM += 60; iftarWarnH -= 1; }
      const iftarWarnTime = `${String(iftarWarnH).padStart(2, "0")}:${String(iftarWarnM).padStart(2, "0")}`;

      if (currentTime === iftarWarnTime) {
        sendNotification("⏰ Iftorlikka 15 daqiqa qoldi!", `Iftorlik vaqti: ${iftorlikTime}`);
      }
    };

    checkTime(); // Check immediately
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [enabled, isSupported, iftorlikTime, saharlikTime, sendNotification]);

  if (!isSupported) return null;

  return (
    <div className="card-glass gold-border p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">Bildirishnomalar</p>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? `Saharlik (${saharlikTime}) va Iftorlik (${iftorlikTime}) vaqtida xabar olasiz`
                : "Iftorlik va saharlik vaqtida xabar olish uchun yoqing"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleNotifications}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-secondary"
          }`}
          aria-label={enabled ? "Bildirishnomalarni o'chirish" : "Bildirishnomalarni yoqish"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
