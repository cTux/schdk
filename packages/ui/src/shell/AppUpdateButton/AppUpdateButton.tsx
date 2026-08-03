import './styles.scss';

import { faRotate } from '@fortawesome/free-solid-svg-icons/faRotate';
import { IconButton } from '../../atoms/IconButton';
import { TooltipProvider } from '../../atoms/Tooltip';
import { useLocalization } from '../../localization';
import type { AppUpdateButtonProps } from './types';

export function AppUpdateButton({ onClick }: AppUpdateButtonProps) {
  const { copy } = useLocalization();
  return (
    <TooltipProvider>
      <IconButton
        className="shell-update-button"
        icon={faRotate}
        label={copy.allWeb.updateAvailable}
        tooltipSide="left"
        onClick={onClick}
      />
    </TooltipProvider>
  );
}
