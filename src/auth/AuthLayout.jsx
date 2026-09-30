/** Moldura comum de login e cadastro: título, formulário e rodapé. */
export function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="mx-auto max-w-100">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
      </div>

      {children}

      <p className="mt-6 text-center text-sm text-muted [&_a]:font-semibold [&_a]:text-accent">
        {footer}
      </p>
    </div>
  );
}

/** Classes do <form> dentro da moldura. */
export const FORM = 'flex flex-col gap-4';
