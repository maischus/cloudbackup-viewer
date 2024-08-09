import { createContext } from '@lit/context';
import { Cloudbackup } from "./cloudbackup";
export { Cloudbackup } from "./cloudbackup";
export const cloudbackupContext = createContext<Cloudbackup>("cloudbackup");