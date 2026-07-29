import { useLocalization } from '../../localization';
import { getShellContent } from '../shellItems';
import { ToolCard } from '../ToolCard';
import { type ShellHomeProps } from './shell-home-props';

function ShellHome({ hidden, onOpen }: ShellHomeProps) {
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

export { type ShellHomeProps, ShellHome };
