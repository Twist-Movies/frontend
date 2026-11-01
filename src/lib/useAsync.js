import { useCallback, useEffect, useState } from 'react';

// Carrega dados assíncronos e refaz a carga quando `deps` mudam.
// Em `recarregar` os dados antigos continuam na tela até os novos chegarem.
export function useAsync(carregar, deps) {
  const [estado, setEstado] = useState({
    data: null,
    error: null,
    loading: true,
  });
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setEstado((atual) => ({ ...atual, loading: true, error: null }));

    carregar()
      .then((data) => {
        if (ativo) setEstado({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (ativo) setEstado({ data: null, error, loading: false });
      });

    return () => {
      ativo = false;
    };
    // `carregar` muda a cada render; quem controla a recarga é `deps`.
  }, [...deps, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  const definir = useCallback(
    (data) => setEstado((atual) => ({ ...atual, data })),
    [],
  );

  return { ...estado, recarregar, definir };
}
