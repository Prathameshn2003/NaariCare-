import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Loader2, AlertCircle } from "lucide-react";
import { haversineDistance, estimateTravelTime } from "../../utils/geo";

interface Doctor {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  distance: number;
}

/* ---------- COMMON FETCH FUNCTION ---------- */
async function fetchNearbyDoctors(
  center: { lat: number; lon: number },
  radiusKm: number
): Promise<Doctor[]> {
  const delta = radiusKm / 111;
  const viewbox = `${center.lon - delta},${center.lat - delta},${center.lon + delta},${center.lat + delta}`;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital+clinic&limit=30&viewbox=${viewbox}&bounded=1`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("OSM error");

  const data = await res.json();

  return data
    .map((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      const distance = haversineDistance(
        center.lat,
        center.lon,
        lat,
        lon
      );

      return {
        id: item.place_id,
        name: item.display_name.split(",")[0],
        lat,
        lon,
        address: item.display_name,
        distance,
      };
    })
    .filter((d: Doctor) => d.distance <= radiusKm)
    .sort((a: Doctor, b: Doctor) => a.distance - b.distance);
}

export const NearbyDoctors = () => {
  /* ---------- SECTION 1: USER LOCATION ---------- */
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [nearby, setNearby] = useState<Doctor[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);

  /* ---------- SECTION 2: CITY SEARCH ---------- */
  const [city, setCity] = useState("");
  const [radiusKm, setRadiusKm] = useState(20);
  const [cityResults, setCityResults] = useState<Doctor[]>([]);
  const [loadingCity, setLoadingCity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- GET USER LOCATION ---------- */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLoc({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () =>
        // fallback: Pune
        setUserLoc({ lat: 18.5204, lon: 73.8567 })
    );
  }, []);

  /* ---------- AUTO LOAD NEARBY (100 KM) ---------- */
  useEffect(() => {
    if (!userLoc) return;

    const loadNearby = async () => {
      try {
        setLoadingNearby(true);
        const results = await fetchNearbyDoctors(userLoc, 100);
        setNearby(results);
      } catch {
        setNearby([]);
      } finally {
        setLoadingNearby(false);
      }
    };

    loadNearby();
  }, [userLoc]);

  /* ---------- CITY SEARCH ---------- */
  const handleCitySearch = async () => {
    if (!city.trim()) return;

    try {
      setError(null);
      setLoadingCity(true);
      setCityResults([]);

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city
        )}`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error();

      const center = {
        lat: parseFloat(geoData[0].lat),
        lon: parseFloat(geoData[0].lon),
      };

      const results = await fetchNearbyDoctors(center, radiusKm);
      setCityResults(results);
    } catch {
      setError("City not found or no doctors available.");
    } finally {
      setLoadingCity(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="glass-card rounded-xl p-6 space-y-10">

      {/* ========== SECTION 1 ========== */}
      <section>
        <h3 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal" />
          Nearby Healthcare Providers (Near You)
        </h3>

        {loadingNearby ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : nearby.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No nearby healthcare providers within 100 km.
          </p>
        ) : (
          <div className="space-y-4">
            {nearby.slice(0, 5).map((doc, index) => (
              <DoctorCard
                key={doc.id}
                doc={doc}
                index={index}
                origin={userLoc!}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========== SECTION 2 ========== */}
      <section>
        <h3 className="font-heading text-lg font-semibold mb-3">
          Search Doctors by City
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Input
            placeholder="Enter city (e.g. Pune)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            type="number"
            min={1}
            max={100}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            placeholder="Radius (km)"
          />
          <Button onClick={handleCitySearch}>Search</Button>
        </div>

        {error && (
          <div className="text-sm text-accent flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loadingCity && <Loader2 className="w-6 h-6 animate-spin" />}

        {!loadingCity && cityResults.length > 0 && (
          <div className="space-y-4">
            {cityResults.slice(0, 5).map((doc, index) => (
              <DoctorCard
                key={doc.id}
                doc={doc}
                index={index}
                origin={doc}
              />
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        This information is for guidance only. Please verify before visiting.
      </p>
    </div>
  );
};

/* ---------- CARD ---------- */
const DoctorCard = ({
  doc,
  index,
  origin,
}: {
  doc: Doctor;
  index: number;
  origin: { lat: number; lon: number };
}) => (
  <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition">
    <div className="flex justify-between gap-4">
      <div>
        <h4 className="font-semibold">
          {doc.name}
          {index === 0 && (
            <span className="ml-2 text-accent inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Nearest
            </span>
          )}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {doc.address}
        </p>
        <p className="text-sm mt-1">
          📍 {doc.distance.toFixed(1)} km • ⏱{" "}
          {estimateTravelTime(doc.distance)} min
        </p>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          window.open(
            `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat},${origin.lon};${doc.lat},${doc.lon}`,
            "_blank"
          )
        }
      >
        View Route
      </Button>
    </div>
  </div>
);
