import { Stub } from './Stub';

export default function Series() {
  return (
    <Stub
      title="Séries"
      sprint="Sprint 4 · Núcleo"
      planned={[
        'Grade de pôsteres com paginação infinita',
        'Filtros por gênero, década, número de temporadas e nota',
        'Ordenação por popularidade, nota média e ano de estreia',
      ]}
    />
  );
}
