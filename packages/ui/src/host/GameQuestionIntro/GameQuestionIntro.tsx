import classNames from 'classnames';
import { useLocalization } from '../../localization';

export function GameQuestionIntro({
  questionNumber,
  className,
}: {
  questionNumber: number;
  className?: string;
}) {
  const { copy } = useLocalization();

  return (
    <div className={classNames('question-intro', className)}>
      {copy.host.questionIntro(questionNumber)}
    </div>
  );
}
