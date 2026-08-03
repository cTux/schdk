import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../atoms/Button';
import { type ToolCardProps } from './tool-card-props';

function ToolCard({ item, onOpen }: ToolCardProps) {
  return (
    <Button type="button" onClick={onOpen}>
      <span className="tool-icon" aria-hidden="true">
        <FontAwesomeIcon icon={item.icon} />
      </span>
      <span>
        <strong>{item.label}</strong>
        <small>{item.description}</small>
      </span>
      <span className="arrow" aria-hidden="true">
        <FontAwesomeIcon icon={faArrowRight} />
      </span>
    </Button>
  );
}

export { type ToolCardProps, ToolCard };
