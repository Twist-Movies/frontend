import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center bg-[radial-gradient(ellipse_at_top_right,#2a2140_0%,#0b0b0f_60%)] bg-cover bg-center text-white"
    >
      <div className="flex min-h-screen w-full items-center bg-linear-to-r from-black/85 via-black/55 to-black/15 px-6 pt-25 pb-15 lg:px-[8%] lg:py-30">
        <div className="max-w-150">
          <p className="mb-4 text-sm font-bold tracking-[4px] opacity-80">
            SUA EXPERIÊNCIA COM FILMES E SÉRIES
          </p>

          <h1 className="mb-6 text-[55px] leading-[0.95] font-black sm:text-[clamp(50px,7vw,100px)]">
            Descubra.{' '}
            <br />
            Avalie.{' '}
            <br />
            Compartilhe.
          </h1>

          <p className="mb-8 max-w-125 text-base leading-relaxed text-white/80 sm:text-lg">
            Encontre novos filmes e séries, registre o que você assistiu e
            compartilhe suas opiniões com outras pessoas.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/cadastro"
              className="inline-block rounded-full bg-white px-7 py-3.5 font-bold text-[#111] transition-transform hover:-translate-y-0.75"
            >
              Criar conta
            </Link>
            <a
              href="#filmes"
              className="inline-block rounded-full border border-white/40 px-7 py-3.5 font-bold transition-transform hover:-translate-y-0.75"
            >
              Explorar filmes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
