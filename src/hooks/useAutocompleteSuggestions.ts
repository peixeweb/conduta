import {useCallback, useEffect, useRef, useState} from 'react';
import {useMapsLibrary} from '@vis.gl/react-google-maps';
import {STORE_INFO} from '../constants/store';
import {notifyQuotaExceededIfApplicable} from '../utils/quotaError';

export interface UseAutocompleteSuggestionsReturn {
  suggestions: google.maps.places.AutocompleteSuggestion[];
  isLoading: boolean;
  error: string | null;
  resetSession: () => void;
}

export function useAutocompleteSuggestions(
  inputString: string,
): UseAutocompleteSuggestionsReturn {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = inputString.trim();
    if (!placesLib || trimmed.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const {AutocompleteSessionToken, AutocompleteSuggestion} = placesLib;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const request: google.maps.places.AutocompleteRequest = {
          input: trimmed,
          sessionToken: sessionTokenRef.current ?? undefined,
          includedRegionCodes: ['br'],
          language: 'pt-BR',
          locationBias: {
            center: STORE_INFO.position,
            radius: 50000,
          },
        };
        const res =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        if (!cancelled) {
          setSuggestions(res?.suggestions ?? []);
        }
      } catch (err) {
        notifyQuotaExceededIfApplicable(err);
        if (!cancelled) {
          setSuggestions([]);
          setError('Não foi possível buscar sugestões de endereço.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [placesLib, inputString]);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
  }, []);

  return {suggestions, isLoading, error, resetSession};
}
