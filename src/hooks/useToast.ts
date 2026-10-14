import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast(duracaoMs = 2400) {
  const [mensagem, setMensagem] = useState('');
  const [visivel, setVisivel] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mostrar = useCallback(
    (msg: string) => {
      setMensagem(msg);
      setVisivel(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisivel(false), duracaoMs);
    },
    [duracaoMs],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { mensagem, visivel, mostrar };
}
