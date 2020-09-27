export interface CreateConfig {
  headless?: boolean;
  devtools?: boolean;
  useChrome?: boolean;
  debug?: boolean;
  browserArgs?: string[];
  logQR?: boolean;
  refreshQR?: number;
  autoClose?: number;
  disableSpins?: boolean;
}

export const defaultOptions: CreateConfig = {
  headless: true,
  devtools: false,
  useChrome: true,
  debug: false,
  logQR: true,
  browserArgs: [''],
  refreshQR: 30000,
  autoClose: 60000,
  disableSpins: false,
};
