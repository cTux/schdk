import './styles.scss';

import { SCHDK_ITEMS, type ShellViewName } from '../shellItems';
import { ToolCard } from '../ToolCard';

export interface ShellHomeProps {
  hidden: boolean;
  onOpen(view: ShellViewName): void;
}

export function ShellHome({ hidden, onOpen }: ShellHomeProps) {
  return (
    <div className="home" hidden={hidden}>
      <header>
        <p className="eyebrow">Домашня</p>
        <h1>Усе для гри в одному місці</h1>
        <p>
          Створіть пакет запитань у редакторі, а потім відкрийте його в розділі
          «Провести гру».
        </p>
      </header>

      <div className="tool-list">
        {SCHDK_ITEMS.map((item) => (
          <ToolCard key={item.id} item={item} onOpen={() => onOpen(item.id)} />
        ))}
      </div>
    </div>
  );
}
