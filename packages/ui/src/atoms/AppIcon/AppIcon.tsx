export interface AppIconProps {
  className?: string;
}

export function AppIcon({ className = 'app-icon' }: AppIconProps) {
  return <img className={className} src="./owl.svg" alt="" />;
}
