import { createContext } from 'react';

/** Vive em arquivo próprio: um módulo que exporta contexto e componente
 *  quebra o fast refresh do Vite. */
export const AuthContext = createContext(null);
