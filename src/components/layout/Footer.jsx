const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-deep px-[5%] py-9 text-center text-sm text-faint">
      <p>Twist {currentYear} - Todos os direitos reservados</p>
    </footer>
  );
}
