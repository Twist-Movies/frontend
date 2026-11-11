const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-deep px-4 py-6 text-center text-sm text-faint md:px-[5%] md:py-9">
      <p>Twist {currentYear} - Todos os direitos reservados</p>
    </footer>
  );
}
