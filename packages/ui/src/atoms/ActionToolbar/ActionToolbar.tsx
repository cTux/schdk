import { Toolbar } from '@base-ui/react/toolbar';
import '../../styles/_primitives.scss';
import type { ActionToolbarProps } from './types';
import { ActionToolbarButton } from '../ActionToolbarButton';
import { ActionToolbarPopover } from '../ActionToolbarPopover';
import { ActionToolbarSeparator } from '../ActionToolbarSeparator';

function ActionToolbar({ label, children }: ActionToolbarProps) {
  return (
    <Toolbar.Root className="action-toolbar" aria-label={label}>
      {children}
    </Toolbar.Root>
  );
}

export {
  ActionToolbar,
  ActionToolbarButton,
  ActionToolbarPopover,
  ActionToolbarSeparator,
};
