const NUMEROS = [
  { valor: '572 mil', rotulo: 'títulos registrados' },
  { valor: '48 mil', rotulo: 'resenhas escritas' },
  { valor: '12 mil', rotulo: 'listas publicadas' },
];

function About() {
  return (
    <section
      id="sobre"
      className="flex min-h-125 items-center bg-surface px-6 py-30 lg:px-[8%]"
    >
      <div className="max-w-175">
        <p className="mb-2.5 text-xs font-bold tracking-[3px] opacity-60">
          SOBRE O TWIST
        </p>

        <h2 className="mb-8 text-[clamp(35px,5vw,65px)] leading-none font-bold">
          O seu espaço para falar sobre cinema.
        </h2>

        <p className="max-w-150 text-lg leading-relaxed text-muted">
          O Twist é uma plataforma criada para quem gosta de filmes e séries.
          Registre o que assistiu, avalie suas experiências e descubra novas
          histórias através da comunidade.
        </p>

        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {NUMEROS.map((n) => (
            <div key={n.rotulo} className="flex flex-col">
              <dt className="text-sm text-muted">{n.rotulo}</dt>
              <dd className="-order-1 text-3xl font-black">{n.valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default About;
