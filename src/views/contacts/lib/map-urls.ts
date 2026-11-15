type MapPoint = { lon: number; lat: number; zoom: number };

// Встраиваемый виджет Яндекс.Карт: работает без API-ключа.
export function yandexMapWidgetUrl({ lon, lat, zoom }: MapPoint): string {
  const point = `${lon},${lat}`;
  const params = new URLSearchParams({
    ll: point,
    z: String(zoom),
    pt: `${point},pm2rdm`,
  });
  return `https://yandex.kz/map-widget/v1/?${params}`;
}

export function yandexMapLinkUrl({ lon, lat, zoom }: MapPoint): string {
  const params = new URLSearchParams({
    pt: `${lon},${lat}`,
    z: String(zoom),
    l: "map",
  });
  return `https://yandex.kz/maps/?${params}`;
}
