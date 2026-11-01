import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, StarRating, Textarea } from '../ui';
import { FormAviso } from '../../auth/FormAviso';
import { avaliarFilme, buscarFilmes, marcarAssistido } from '../../api/movies';
import { criarResenha } from '../../api/reviews';
import { anoDe } from '../../lib/tmdbImage';

const VAZIO = { termo: '', resultados: null, escolhido: null, nota: 0, texto: '' };

export function LogFilmModal({ open, onClose }) {
  const [estado, setEstado] = useState(VAZIO);
  const [spoiler, setSpoiler] = useState(false);
  const [erro, setErro] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const navigate = useNavigate();

  const alterar = (parcial) => setEstado((e) => ({ ...e, ...parcial }));

  function fechar() {
    setEstado(VAZIO);
    setSpoiler(false);
    setErro(null);
    onClose();
  }

  async function buscar(e) {
    e.preventDefault();
    const termo = estado.termo.trim();
    if (!termo) return;
    setOcupado(true);
    setErro(null);
    try {
      const dados = await buscarFilmes({ q: termo });
      alterar({ resultados: dados.results.slice(0, 6) });
    } catch (falha) {
      setErro(falha);
    } finally {
      setOcupado(false);
    }
  }

  async function registrar(e) {
    e.preventDefault();
    const id = estado.escolhido.tmdb_id;
    setOcupado(true);
    setErro(null);
    try {
      await marcarAssistido(id);
      if (estado.nota > 0) await avaliarFilme(id, estado.nota);
      if (estado.texto.trim()) {
        await criarResenha(id, {
          content: estado.texto.trim(),
          containsSpoiler: spoiler,
        });
      }
      fechar();
      navigate(`/filme/${id}`);
    } catch (falha) {
      setErro(falha);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Modal open={open} title="Registrar filme" onClose={fechar}>
      <div className="flex flex-col gap-4">
        <FormAviso erro={erro} />

        {!estado.escolhido ? (
          <>
            <form role="search" className="flex gap-2" onSubmit={buscar}>
              <Input
                aria-label="Buscar filme"
                placeholder="Título do filme"
                value={estado.termo}
                onChange={(e) => alterar({ termo: e.target.value })}
              />
              <Button type="submit" disabled={ocupado}>
                Buscar
              </Button>
            </form>

            {estado.resultados?.length === 0 && (
              <p className="text-sm text-muted">Nenhum filme encontrado.</p>
            )}
            <ul className="flex flex-col gap-1">
              {estado.resultados?.map((filme) => (
                <li key={filme.tmdb_id}>
                  <button
                    type="button"
                    className="w-full cursor-pointer rounded-md px-3 py-2 text-left hover:bg-surface-2"
                    onClick={() => alterar({ escolhido: filme })}
                  >
                    <span className="font-semibold">{filme.title}</span>
                    {anoDe(filme.release_date) && (
                      <span className="text-muted">
                        {' '}
                        ({anoDe(filme.release_date)})
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={registrar}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{estado.escolhido.title}</p>
              <Button
                type="button"
                variant="quiet"
                onClick={() => alterar({ escolhido: null })}
              >
                Trocar
              </Button>
            </div>
            <StarRating
              size="lg"
              value={estado.nota}
              onChange={(nota) => alterar({ nota })}
              label="Sua nota"
            />
            <Textarea
              aria-label="Resenha (opcional)"
              placeholder="Resenha (opcional)"
              maxLength={5000}
              value={estado.texto}
              onChange={(e) => alterar({ texto: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={spoiler}
                onChange={(e) => setSpoiler(e.target.checked)}
              />
              Contém spoilers
            </label>
            <Button type="submit" variant="primary" disabled={ocupado}>
              {ocupado ? 'Registrando…' : 'Registrar como assistido'}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
