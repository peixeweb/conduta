import facadePhoto from '../assets/aistudio/fachada_conduta.jpg';

export type TravelModeOption = 'DRIVING' | 'TWO_WHEELER' | 'WALKING';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface RouteStepSummary {
  instruction: string;
  distanceText: string;
  durationText: string;
}

export interface ComputedRouteSummary {
  distanceMeters: number;
  durationMillis: number;
  distanceText: string;
  durationText: string;
  steps: RouteStepSummary[];
}

export const STORE_INFO = {
  shortName: 'Conduta Autopeças',
  fullName: 'Conduta Locações, Autopeças e Manutenções',
  numberLabel: '2948C',
  segment: 'Linha Diesel e Leve',
  cityLabel: 'Piripiri · PI',
  position: {lat: -4.3018578, lng: -41.7741535} as LatLngPoint,
  mapsShareUrl: 'https://maps.app.goo.gl/T7ihomcoQcfvyb9L8',
  photoUrl: facadePhoto,
  whatsappNumber: '5586988778884',
  whatsappDisplay: '55 86 98877-8884',
  specialties: [
    {
      title: 'Óleos e Lubrificantes',
      detail: 'Troca e linha completa para motores diesel e linha leve.',
    },
    {
      title: 'Filtros Automotivos',
      detail: 'Filtros de óleo, combustível, ar e cabine de alta retenção.',
    },
    {
      title: 'Sistema de Freios',
      detail: 'Pastilhas, lonas, discos, tambores e componentes pneumáticos.',
    },
    {
      title: 'Suspensão e Rodas',
      detail: 'Amortecedores, molas, buchas, cubos e rodagem pesada.',
    },
    {
      title: 'Parte Elétrica',
      detail: 'Alternadores, motores de partida, baterias e iluminação.',
    },
    {
      title: 'Locações e Manutenções',
      detail: 'Atendimento especializado e suporte técnico para frotas.',
    },
  ],
  brands: ['Toyota', 'Volkswagen', 'CAT', 'Stihl'],
} as const;

export const TRAVEL_MODE_LABELS: Record<TravelModeOption, string> = {
  DRIVING: 'Carro',
  TWO_WHEELER: 'Moto',
  WALKING: 'A pé',
};

export function getWhatsAppUrl(customMessage?: string): string {
  const defaultMsg =
    'Olá! Vi a localização da Conduta Locações, Autopeças e Manutenções (2948C) e gostaria de falar com a loja.';
  const text = encodeURIComponent(customMessage ?? defaultMsg);
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${text}`;
}

export function getGoogleMapsDirectionsUrl(
  origin?: LatLngPoint | null,
  travelMode: TravelModeOption = 'DRIVING',
): string {
  const modeMap: Record<TravelModeOption, string> = {
    DRIVING: 'driving',
    TWO_WHEELER: 'two-wheeler',
    WALKING: 'walking',
  };
  const params = new URLSearchParams({
    api: '1',
    destination: `${STORE_INFO.position.lat},${STORE_INFO.position.lng}`,
    travelmode: modeMap[travelMode],
  });
  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function formatDistancePt(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatDurationPt(millis: number): string {
  const totalMinutes = Math.max(1, Math.round(millis / 60000));
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
}
