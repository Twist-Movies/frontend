import { useState } from 'react';
import { Button, Field, Input, Modal, Textarea } from '../ui';
import { FormAviso } from '../../auth/FormAviso';
import { criarPlaylist, editarPlaylist } from '../../api/playlists';
import { AVATAR_MAX_MB, AVATAR_TIPOS } from '../../auth/validacao';

// Criação (sem `playlist`) e edição (com `playlist`) da lista.
export function PlaylistFormModal({ open, playlist, onClose, onSaved }) {
  const [dados, setDados] = useState({
    name: playlist?.name ?? '',
    description: playlist?.description ?? '',
    isPublic: playlist?.is_public ?? true,
    cover: null,
  });
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo, valor) => {
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    setFalha(null);
    if (!dados.name.trim()) {
      setErros({ name: 'Dê um nome à lista.' });
      return;
    }
    if (dados.cover && !AVATAR_TIPOS.includes(dados.cover.type)) {
      setErros({ cover: 'Formato não suportado. Use JPEG, PNG ou WebP.' });
      return;
    }
    if (dados.cover && dados.cover.size > AVATAR_MAX_MB * 1024 * 1024) {
      setErros({ cover: `A imagem deve ter no máximo ${AVATAR_MAX_MB}MB.` });
      return;
    }

    setEnviando(true);
    try {
      const envio = { ...dados, name: dados.name.trim() };
      const salva = playlist
        ? await editarPlaylist(playlist.id, envio)
        : await criarPlaylist(envio);
      onSaved(salva);
    } catch (erro) {
      if (erro.fieldErrors && Object.keys(erro.fieldErrors).length > 0) {
        setErros({ name: erro.fieldErrors.name, cover: erro.fieldErrors.cover });
      }
      setFalha(erro);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open={open}
      title={playlist ? 'Editar lista' : 'Nova lista'}
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
        <FormAviso erro={falha} />

        <Field label="Nome" error={erros.name}>
          {(id) => (
            <Input
              id={id}
              maxLength={150}
              value={dados.name}
              invalid={Boolean(erros.name)}
              onChange={(e) => alterar('name', e.target.value)}
            />
          )}
        </Field>

        <Field label="Descrição (opcional)">
          {(id) => (
            <Textarea
              id={id}
              maxLength={1000}
              value={dados.description}
              onChange={(e) => alterar('description', e.target.value)}
            />
          )}
        </Field>

        <Field
          label="Capa (opcional)"
          hint={`JPEG, PNG ou WebP, até ${AVATAR_MAX_MB}MB.`}
          error={erros.cover}
        >
          {(id) => (
            <Input
              id={id}
              type="file"
              accept={AVATAR_TIPOS.join(',')}
              invalid={Boolean(erros.cover)}
              onChange={(e) => alterar('cover', e.target.files?.[0] ?? null)}
            />
          )}
        </Field>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={dados.isPublic}
            onChange={(e) => alterar('isPublic', e.target.checked)}
          />
          Lista pública
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
