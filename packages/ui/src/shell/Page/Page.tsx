import './styles.scss';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import type { PageProps } from './types';

function Page({ children, headerContent, onBack, title }: PageProps) {
  const { copy } = useLocalization();

  return (
    <section className="page">
      <header className="page-header">
        <IconButton
          className="page-back-button"
          variant="ghost"
          icon={faArrowLeft}
          label={copy.shared.back}
          onClick={onBack}
        />
        <h1>{title}</h1>
        {headerContent}
      </header>
      <div className="page-content">{children}</div>
    </section>
  );
}

export { Page, type PageProps };
