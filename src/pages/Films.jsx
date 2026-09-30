import { Stub } from './Stub';

export default function Films() {
  return (
    <Stub
      title="Filmes"
      sprint="Sprint 4 · Núcleo"
      planned={[
        'Grade de pôsteres com paginação infinita',
        'Filtros por gênero, década, duração e nota',
        'Ordenação por popularidade, nota média e data de lançamento',
      ]}
    />
  );
}
