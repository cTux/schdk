import './styles.scss';

import {
  getShellContent,
  type ShellLocale,
  type ShellViewName,
} from '../shellItems';
import { ToolCard } from '../ToolCard';

export interface ShellHomeProps {
  hidden: boolean;
  locale: ShellLocale;
  onOpen(view: ShellViewName): void;
}

export function ShellHome({ hidden, locale, onOpen }: ShellHomeProps) {
  const content = getShellContent(locale);

  return (
    <div className="home" hidden={hidden}>
      <header>
        <p className="eyebrow">{content.homeItem.label}</p>
        <h1>{content.homeTitle}</h1>
        <p>{content.homeDescription}</p>
      </header>

      <div className="tool-list">
        {content.items.map((item) => (
          <ToolCard key={item.id} item={item} onOpen={() => onOpen(item.id)} />
        ))}
      </div>
    </div>
  );
}
