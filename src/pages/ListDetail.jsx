import { Stub } from './Stub';

export default function ListDetail() {
  return (
    <Stub
      title="Lista"
      sprint="Sprint 6 · Coleções"
      planned={[
        'Cabeçalho com título, autor, descrição e curtidas',
        'Grade dos filmes, numerada quando a lista for ranqueada',
        'Edição inline e reordenação por arrastar',
      ]}
    />
  );
}
