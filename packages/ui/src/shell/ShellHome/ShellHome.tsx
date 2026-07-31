import { useLocalization } from '../../localization';
import { Page } from '../Page';
import { getShellContent } from '../shellItems';
import { ToolCard } from '../ToolCard';
import { type ShellHomeProps } from './shell-home-props';

function ShellHome({ hidden, onOpen }: ShellHomeProps) {
  const { copy } = useLocalization();
  const content = getShellContent(copy);

  return (
    <Page
      className="home"
      hidden={hidden}
      title={content.homeTitle}
      headerContent={<p>{content.homeDescription}</p>}
    >
      <div className="tool-list">
        {content.items.map((item) => (
          <ToolCard key={item.id} item={item} onOpen={() => onOpen(item.id)} />
        ))}
      </div>
    </Page>
  );
}

export { type ShellHomeProps, ShellHome };
