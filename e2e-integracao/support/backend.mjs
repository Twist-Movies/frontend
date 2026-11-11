// Prepara e sobe o Django real para o e2e de integração (settings e2e:
// SQLite descartável + e-mail em arquivo). Nunca usa chaves de e-mail reais.
import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const backend = resolve(aqui, '../../../backend');
const python = resolve(backend, '.venv/Scripts/python.exe');
const PORTA = process.env.E2E_BACKEND_PORT || '8011';

const env = {
  ...process.env,
  DJANGO_SETTINGS_MODULE: 'config.settings.e2e',
  BREVO_API_KEY: '',
  RESEND_API_KEY: '',
  PYTHONIOENCODING: 'utf-8',
};

rmSync(resolve(backend, 'e2e_db.sqlite3'), { force: true });
rmSync(resolve(backend, '.e2e_mail'), { recursive: true, force: true });

const migrar = spawnSync(python, ['manage.py', 'migrate', '--noinput'], {
  cwd: backend,
  env,
  stdio: 'inherit',
});
if (migrar.status !== 0) process.exit(migrar.status ?? 1);

const servidor = spawn(
  python,
  ['manage.py', 'runserver', `127.0.0.1:${PORTA}`, '--noreload'],
  { cwd: backend, env, stdio: 'inherit' },
);
const encerrar = () => servidor.kill();
process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);
process.on('exit', encerrar);
servidor.on('exit', (codigo) => process.exit(codigo ?? 0));
