# E2E de integração (recuperação de senha)

Navegador (Edge) -> Vite dev (porta 5189, proxy real de `/api`) -> Django real
(`127.0.0.1:8011`, `config.settings.e2e`) -> e-mail gravado em arquivo. **Sem `page.route`**.

```bash
npm run e2e:integracao
```

Pré-requisito: `backend/.venv` com as dependências instaladas. Nada mais: o Playwright sobe
os dois servidores sozinho (`support/backend.mjs` apaga o banco/e-mails antigos, roda
`migrate` e `runserver --noreload`).

- Backend: `backend/config/settings/e2e.py` usa SQLite descartável (`backend/e2e_db.sqlite3`),
  `EmailBackend` de arquivo em `backend/.e2e_mail/` e `FRONTEND_URL=http://localhost:5189`.
  Nenhum e-mail real é enviado e as chaves BREVO/RESEND são zeradas no processo.
- `support/email.js` espera (poll) o e-mail novo na pasta e extrai o link de redefinição.
- O TMDB não é usado (a home mostra 503 do `/discover` no log do backend; é esperado).
- Usa uma config separada (`playwright.integracao.config.js`); `npm run e2e` não é afetado.
- O Chrome pode ser usado com `PW_CHANNEL=chrome`. Nunca rode `playwright install`.
