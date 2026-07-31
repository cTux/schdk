import './styles.scss';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import type { PageProps } from './types';

function Page({
  children,
  className,
  headerContent,
  hidden,
  onBack,
  title,
}: PageProps) {
  const { copy } = useLocalization();

  return (
    <section className={classNames('page', className)} hidden={hidden}>
      <header className="page-header">
        {onBack && (
          <IconButton
            className="page-back-button"
            variant="ghost"
            icon={faArrowLeft}
            label={copy.shared.back}
            onClick={onBack}
          />
        )}
        <div className="page-heading">
          <h1>{title}</h1>
          {headerContent}
        </div>
      </header>
      <div className="page-content">{children}</div>
    </section>
  );
}

export { Page, type PageProps };
