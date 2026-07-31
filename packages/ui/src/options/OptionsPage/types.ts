import { type OptionsPageProps } from './types/options-page-props';

type GoogleDriveState =
  | 'unavailable'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reauthorization-required'
  | 'error';

export { type GoogleDriveState, type OptionsPageProps };
