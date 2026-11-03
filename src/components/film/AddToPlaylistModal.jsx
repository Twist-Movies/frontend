import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, ErrorState, Modal } from '../ui';
import { FormAviso } from '../../auth/FormAviso';
import { adicionarFilmeNaPlaylist, listarPlaylists } from '../../api/playlists';

export function AddToPlaylistModal({ open, tmdbId, onClose }) {
  const [playlists, setPlaylists] = useState(null);
  const [erroCarga, setErroCarga] = useState(null);
  const [erro, setErro] = useState(null);
  const [adicionada, setAdicionada] = useState(null);

  useEffect(() => {
    if (!open) return;
    let ativo = true;
    setPlaylists(null);
    setErroCarga(null);
    setErro(null);
    setAdicionada(null);
    listarPlaylists()
      .then((dados) => ativo && setPlaylists(dados.results))
      .catch((e) => ativo && setErroCarga(e));
    return () => {
      ativo = false;
    };
  }, [open]);

  async function adicionar(playlist) {
    setErro(null);
    setAdicionada(null);
    try {
      await adicionarFilmeNaPlaylist(playlist.id, tmdbId);
      setAdicionada(playlist.name);
    } catch (e) {
      setErro(e);
    }
  }

  return (
    <Modal open={open} title="Adicionar a uma lista" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <FormAviso erro={erro} />
        {adicionada && (
          <p role="status" className="text-sm text-success">
            Filme adicionado a “{adicionada}”.
          </p>
        )}
        {erroCarga && <ErrorState error={erroCarga} />}
        {!playlists && !erroCarga && <p className="text-muted">Carregando…</p>}
        {playlists?.length === 0 && (
          <EmptyState
            title="Você ainda não tem listas"
            action={
              <Link to="/listas" className="text-accent" onClick={onClose}>
                Criar uma lista
              </Link>
            }
          />
        )}
        {playlists?.map((playlist) => (
          <Button
            key={playlist.id}
            variant="ghost"
            className="justify-between"
            onClick={() => adicionar(playlist)}
          >
            <span>{playlist.name}</span>
            <span className="text-xs text-faint">
              {playlist.is_public ? 'Pública' : 'Privada'}
            </span>
          </Button>
        ))}
      </div>
    </Modal>
  );
}
