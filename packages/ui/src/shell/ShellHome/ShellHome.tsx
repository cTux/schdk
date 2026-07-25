import './styles.scss';

import { useLocalization } from '../../localization';
import { getShellContent, type ShellViewName } from '../shellItems';
import { ToolCard } from '../ToolCard';

export interface ShellHomeProps {
  hidden: boolean;
  onOpen(view: ShellViewName): void;
}

export function ShellHome({ hidden, onOpen }: ShellHomeProps) {
  const { copy } = useLocalization();
  const content = getShellContent(copy);

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
