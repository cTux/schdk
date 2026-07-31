import './styles.scss';
import { type AppIconProps } from './types';

function AppIcon({ className = 'app-icon' }: AppIconProps) {
  return <img className={className} src="./owl.svg" alt="" />;
}

export { AppIcon };
