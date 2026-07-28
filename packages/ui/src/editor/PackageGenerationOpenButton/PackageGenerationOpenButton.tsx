import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import type { PackageGenerationOpenButtonProps } from './types';

export function PackageGenerationOpenButton({
  apiKeyConfigured,
  onClick,
}: PackageGenerationOpenButtonProps) {
  const { copy } = useLocalization();
  return (
    <IconButton
      icon={faWandMagicSparkles}
      label={copy.packageGeneration.open}
      tooltipLabel={
        apiKeyConfigured
          ? copy.packageGeneration.open
          : copy.questionGeneration.apiKeyMissing
      }
      disabled={!apiKeyConfigured}
      onClick={onClick}
    />
  );
}
