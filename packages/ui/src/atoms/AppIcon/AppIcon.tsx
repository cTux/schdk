import './styles.scss';
import { type AppIconProps } from './app-icon-props';

function AppIcon({ className = 'app-icon' }: AppIconProps) {
  return <img className={className} src="./owl.svg" alt="" />;
}

export { type AppIconProps, AppIcon };
