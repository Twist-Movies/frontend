function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">

      <p>
        Twist {currentYear} - Todos os direitos reservados
      </p>

    </footer>
  );
}

export default Footer;