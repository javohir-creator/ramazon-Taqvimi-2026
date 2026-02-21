import { useState, useEffect, useCallback } from "react";
import { Compass, Navigation, MapPin } from "lucide-react";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Calculate Qibla direction from any GPS coordinate
const calculateQiblaDirection = (lat: number, lng: number): number => {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
  const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

  const dLng = kaabaLngRad - lngRad;
  const x = Math.sin(dLng);
  const y = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(dLng);
  const qibla = (Math.atan2(x, y) * 180) / Math.PI;
  return (qibla + 360) % 360;
};

// Fallback directions per region
const fallbackDirections: Record<string, number> = {
  "Toshkent shahri": 239, "Toshkent viloyati": 239,
  "Samarqand": 241, "Buxoro": 243, "Farg'ona": 237,
  "Andijon": 236, "Namangan": 237, "Xorazm": 246,
  "Qashqadaryo": 242, "Surxondaryo": 240, "Navoiy": 244,
  "Jizzax": 240, "Sirdaryo": 239, "Qoraqalpog'iston": 248,
};

interface QiblaCompassProps {
  region: string;
}

const QiblaCompass = ({ region }: QiblaCompassProps) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<"idle" | "granted" | "denied">("idle");
  const [qiblaAngle, setQiblaAngle] = useState(fallbackDirections[region] || 239);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Update fallback when region changes
  useEffect(() => {
    if (!userCoords) {
      setQiblaAngle(fallbackDirections[region] || 239);
    }
  }, [region, userCoords]);

  // Try to get GPS on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      setGpsStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          const angle = calculateQiblaDirection(latitude, longitude);
          setQiblaAngle(Math.round(angle * 10) / 10);
          setGpsStatus("success");
        },
        () => {
          setGpsStatus("error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const startListening = useCallback(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const heading = ev.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
      if (heading != null) {
        setDeviceHeading(heading);
      }
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, []);

  const requestPermission = async () => {
    const DevOrient =
      typeof window !== "undefined"
        ? (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<"granted" | "denied"> } })
            .DeviceOrientationEvent
        : undefined;
    if (DevOrient && typeof DevOrient.requestPermission === "function") {
      try {
        const permission = await DevOrient.requestPermission();
        setPermissionState(permission === "granted" ? "granted" : "denied");
      } catch {
        setPermissionState("denied");
      }
    } else if (DevOrient) {
      setPermissionState("granted");
    } else {
      setPermissionState("denied");
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (permissionState === "granted") {
      const cleanup = startListening();
      return cleanup;
    }
  }, [permissionState, startListening]);

  const needleRotation = deviceHeading != null ? qiblaAngle - deviceHeading : qiblaAngle;

  return (
    <div className="card-glass gold-border p-5 md:p-6 text-center space-y-5">
      <div className="flex items-center justify-center gap-2">
        <Compass className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold font-serif text-foreground">Qibla Kompasi</h3>
      </div>

      <div className="relative inline-flex items-center justify-center">
        <svg className="w-52 h-52 md:w-64 md:h-64" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="95" fill="none" stroke="hsl(162 25% 20%)" strokeWidth="2" />
          <g transform={`rotate(${needleRotation}, 100, 100)`} className="transition-transform duration-300 ease-out">
            <polygon points="100,25 95,100 105,100" fill="hsl(43 65% 52%)" opacity="0.95" />
            <rect x="95" y="18" width="10" height="10" rx="1" fill="hsl(43 65% 52%)" />
            <text x="100" y="26" textAnchor="middle" dominantBaseline="central" fontSize="8">🕋</text>
          </g>
          <circle cx="100" cy="100" r="5" fill="hsl(43 65% 52%)" />
          <circle cx="100" cy="100" r="3" fill="hsl(162 50% 8%)" />
        </svg>
      </div>

      {/* GPS status */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Qibla yo'nalishi: <span className="text-primary font-semibold">{Math.round(qiblaAngle)}°</span>
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <MapPin className="w-3 h-3" />
          {gpsStatus === "loading" && <span className="text-muted-foreground">GPS aniqlanmoqda...</span>}
          {gpsStatus === "success" && userCoords && (
            <span className="text-primary">GPS orqali aniqlandi ({userCoords.lat.toFixed(2)}°, {userCoords.lng.toFixed(2)}°)</span>
          )}
          {gpsStatus === "error" && <span className="text-muted-foreground">{region} uchun taxminiy</span>}
          {gpsStatus === "idle" && <span className="text-muted-foreground">{region} uchun taxminiy</span>}
        </div>
      </div>

      {permissionState === "denied" && (
        <button
          onClick={requestPermission}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Kompasga ruxsat bering
        </button>
      )}
      {permissionState === "granted" && deviceHeading != null && (
        <p className="text-xs text-primary">Qurilma kompasi faol ✓</p>
      )}
      {permissionState === "granted" && deviceHeading == null && (
        <p className="text-xs text-muted-foreground">Kompas ma'lumoti kutilmoqda... (Mobilda ishlaydi)</p>
      )}
    </div>
  );
};

export default QiblaCompass;
