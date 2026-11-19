import {useState} from 'react';
import {Store} from 'lucide-react';
import {STORE_INFO} from '../constants/store';

interface StoreFacadeImageProps {
  className?: string;
  alt?: string;
}

export function StoreFacadeImage({
  className = 'w-full h-full object-cover',
  alt = 'Fachada azul da Conduta Locações, Autopeças e Manutenções — Número 2948C',
}: StoreFacadeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Store className="w-10 h-10 mb-2 text-amber-300" aria-hidden="true" />
        <p className="font-display font-bold text-lg leading-tight">
          {STORE_INFO.shortName}
        </p>
        <p className="text-xs text-blue-100 mt-1">
          {STORE_INFO.numberLabel} · {STORE_INFO.segment}
        </p>
      </div>
    );
  }

  return (
    <img
      src={STORE_INFO.photoUrl}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
