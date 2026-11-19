import {useEffect, useRef} from 'react';
import {useMap, useMapsLibrary} from '@vis.gl/react-google-maps';
import {
  ComputedRouteSummary,
  LatLngPoint,
  RouteStepSummary,
  TravelModeOption,
  formatDistancePt,
  formatDurationPt,
} from '../constants/store';
import {notifyQuotaExceededIfApplicable} from '../utils/quotaError';

interface RouteLayerProps {
  origin: LatLngPoint | null;
  destination: LatLngPoint;
  travelMode: TravelModeOption;
  onRouteLoading: (loading: boolean) => void;
  onRouteComputed: (summary: ComputedRouteSummary | null) => void;
  onRouteError: (message: string | null) => void;
}

interface SdkRouteStep {
  instructions?: string;
  navigationInstruction?: {instructions?: string};
  distanceMeters?: number;
  staticDurationMillis?: number;
  localizedValues?: {
    distance?: {text?: string};
    staticDuration?: {text?: string};
  };
}

interface SdkRouteLeg {
  steps?: SdkRouteStep[];
}

interface SdkRoute {
  distanceMeters?: number;
  durationMillis?: number;
  viewport?: google.maps.LatLngBounds;
  legs?: SdkRouteLeg[];
  createPolylines?: () => google.maps.Polyline[];
}

export function RouteLayer({
  origin,
  destination,
  travelMode,
  onRouteLoading,
  onRouteComputed,
  onRouteError,
}: RouteLayerProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    const clearPolylines = () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };

    clearPolylines();

    if (!routesLib || !map || !origin) {
      onRouteLoading(false);
      onRouteComputed(null);
      onRouteError(null);
      return;
    }

    let cancelled = false;
    onRouteLoading(true);
    onRouteError(null);

    const request = {
      origin,
      destination,
      travelMode,
      language: 'pt-BR',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    };

    const RouteClass = (
      routesLib as unknown as {
        Route?: {
          computeRoutes?: (
            req: typeof request,
          ) => Promise<{routes?: SdkRoute[]}>;
        };
      }
    ).Route;

    if (!RouteClass?.computeRoutes) {
      onRouteLoading(false);
      onRouteError('Serviço de rotas indisponível no momento.');
      return;
    }

    RouteClass.computeRoutes(request)
      .then((response) => {
        if (cancelled) return;
        onRouteLoading(false);

        const primaryRoute = response?.routes?.[0];
        if (!primaryRoute) {
          onRouteComputed(null);
          onRouteError(
            'Nenhuma rota encontrada para este ponto de partida e modo de viagem.',
          );
          return;
        }

        const created: google.maps.Polyline[] = [];

        if (typeof primaryRoute.createPolylines === 'function') {
          const outlinePolylines = primaryRoute.createPolylines();
          outlinePolylines.forEach((polyline) => {
            polyline.setOptions({
              strokeColor: '#1E3A8A',
              strokeOpacity: 0.35,
              strokeWeight: 10,
              zIndex: 10,
            });
            polyline.setMap(map);
            created.push(polyline);
          });

          const mainPolylines = primaryRoute.createPolylines();
          mainPolylines.forEach((polyline) => {
            polyline.setOptions({
              strokeColor: '#0057D9',
              strokeOpacity: 0.95,
              strokeWeight: 6,
              zIndex: 11,
            });
            polyline.setMap(map);
            created.push(polyline);
          });
        }

        polylinesRef.current = created;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, {
            top: 56,
            right: 56,
            bottom: 56,
            left: 56,
          });
        }

        const distanceMeters = primaryRoute.distanceMeters ?? 0;
        const durationMillis = primaryRoute.durationMillis ?? 0;

        const rawSteps = primaryRoute.legs?.[0]?.steps ?? [];
        const steps: RouteStepSummary[] = rawSteps
          .map((step) => {
            const instruction =
              step.navigationInstruction?.instructions ||
              step.instructions ||
              '';
            if (!instruction) return null;
            const stepDistance =
              step.localizedValues?.distance?.text ||
              (step.distanceMeters ? formatDistancePt(step.distanceMeters) : '');
            const stepDuration =
              step.localizedValues?.staticDuration?.text ||
              (step.staticDurationMillis
                ? formatDurationPt(step.staticDurationMillis)
                : '');
            return {
              instruction,
              distanceText: stepDistance,
              durationText: stepDuration,
            };
          })
          .filter((item): item is RouteStepSummary => item !== null);

        onRouteComputed({
          distanceMeters,
          durationMillis,
          distanceText: formatDistancePt(distanceMeters),
          durationText: formatDurationPt(durationMillis),
          steps,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        onRouteLoading(false);
        onRouteComputed(null);
        notifyQuotaExceededIfApplicable(err);
        onRouteError(
          'Não foi possível calcular a rota dentro do mapa. Você ainda pode abrir o trajeto direto no app Google Maps.',
        );
      });

    return () => {
      cancelled = true;
      clearPolylines();
    };
  }, [
    routesLib,
    map,
    origin,
    destination,
    travelMode,
    onRouteLoading,
    onRouteComputed,
    onRouteError,
  ]);

  return null;
}
