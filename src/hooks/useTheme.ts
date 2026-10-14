import { useCallback, useState } from 'react';

type Tema = 'light' | 'dark';

const atual = (): Tema =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

/** O tema inicial já foi resolvido pelo script inline do index.html (sem flash). */
export function useTheme() {
  const [tema, setTema] = useState<Tema>(atual);

  const alternar = useCallback(() => {
    const novo: Tema = atual() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', novo);
    try {
      localStorage.setItem('clt-theme', novo);
    } catch {
      /* armazenamento indisponível: preferência não persiste */
    }
    setTema(novo);
  }, []);

  return { tema, alternar };
}
