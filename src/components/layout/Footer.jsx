const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-deep px-[5%] py-9 text-center text-sm text-faint">
      <p>Twist {currentYear} - Todos os direitos reservados</p>
      <p className="mt-1 text-xs">Dados fictícios enquanto não há back-end.</p>
    </footer>
  );
}
