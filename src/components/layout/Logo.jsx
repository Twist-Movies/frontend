import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

/** Camaleão + nome. O nome acessível do link é "TWIST". */
export function Logo({ to }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="TWIST">
      <img src={logo} alt="" className="size-9" />
      <span className="text-xl font-black tracking-[3px]">TWIST</span>
    </Link>
  );
}
