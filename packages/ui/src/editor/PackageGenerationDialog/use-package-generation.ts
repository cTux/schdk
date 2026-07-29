import * as common from '@schdk/common';
import { useRef, useState } from 'react';
import { useConfirmationDialog } from '../../atoms/ConfirmationDialog';
import { useLocalization } from '../../localization';
import * as gen from './generation-input';
import type { PackageGenerationDialogProps } from './types';

function usePackageGeneration({
  templates,
  packages,
  gamePackage,
  onGenerationStart,
  onGenerate,
  onGenerated,
  onGenerationStateChange,
  onSelectQuestion,
}: PackageGenerationDialogProps) {
  const { copy } = useLocalization();
  const cancelDialog = useConfirmationDialog();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<gen.PackageGenerationScope>('missing');
  const [ruleSet, setRuleSet] = useState<gen.PackageGenerationRuleSet>('all');
  const [difficulty, setDifficulty] =
    useState<common.AIQuestionDifficulty>('medium');
  const [recognizability, setRecognizability] =
    useState<common.AIQuestionRecognizability>('easy');
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [excludedAnswers, setExcludedAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] =
    useState<gen.PackageGenerationInput | null>(null);
  const [checkQuestionDatabase, setCheckQuestionDatabase] = useState(false);
  const generationId = useRef(0);
  const activePackages = packages
    .filter((item) => item.enabled)
    .sort(common.compareFavoriteItemsByName);
  const randomTemplates = gen.getPackageGenerationTemplates(templates, ruleSet);
  const selectedPackage =
    selected === null ? undefined : activePackages[selected];
  const { targets, initialExcludedAnswers, previewInput } =
    gen.getPackageGenerationState(
      gamePackage,
      scope,
      selectedPackage,
      templates,
      ruleSet,
      progress,
      currentInput,
    );

  function reset() {
    generationId.current += 1;
    setOpen(false);
    setScope('missing');
    setRuleSet('all');
    setDifficulty('medium');
    setRecognizability('easy');
    setSelected(null);
    setThinking(false);
    setFailed(false);
    setProgress(null);
    setPromptOpen(false);
    setExcludedAnswers([]);
    setCurrentInput(null);
    setCheckQuestionDatabase(false);
    onGenerationStateChange([], false);
  }

  function show() {
    setSelected(activePackages.length ? 0 : null);
    setOpen(true);
    onGenerationStateChange([], true);
  }

  async function cancel() {
    if (await cancelDialog.confirm(copy.packageGeneration.cancelConfirmation)) {
      reset();
    }
  }

  async function generate() {
    if (!selectedPackage || !randomTemplates.length || !targets.length) return;
    const currentGenerationId = ++generationId.current;
    onGenerationStateChange(targets, true);
    setThinking(true);
    setFailed(false);
    onSelectQuestion(targets[0]!);
    try {
      await onGenerationStart?.(checkQuestionDatabase);
      if (currentGenerationId !== generationId.current) return;
      const usedAnswers = [...initialExcludedAnswers];
      for (const [position, index] of targets.entries()) {
        const input = gen.getPackageGenerationInput(
          selectedPackage,
          templates,
          index,
          ruleSet,
          scope === 'commented' ? gamePackage.questions[index] : undefined,
        );
        if (!input) throw new Error('Missing generation input');
        setCurrentInput(input);
        setProgress([position + 1, targets.length]);
        setExcludedAnswers([...usedAnswers]);
        const question = await onGenerate(
          input.template,
          input.context,
          usedAnswers,
          difficulty,
          checkQuestionDatabase,
          recognizability,
        );
        if (currentGenerationId !== generationId.current) return;
        onGenerated(
          index,
          scope === 'commented'
            ? { ...question, comment: undefined }
            : question,
        );
        onGenerationStateChange(targets.slice(position + 1), true);
        usedAnswers.push(...common.getGameQuestionAnswers(question));
      }
      reset();
    } catch {
      if (currentGenerationId !== generationId.current) return;
      setThinking(false);
      setFailed(true);
      onGenerationStateChange([], true);
    }
  }

  return {
    activePackages,
    cancel,
    cancelDialogProps: cancelDialog.dialogProps,
    checkQuestionDatabase,
    difficulty,
    excludedAnswers,
    failed,
    generate,
    initialExcludedAnswers,
    open,
    previewInput,
    progress,
    promptOpen,
    randomTemplates,
    recognizability,
    reset,
    ruleSet,
    scope,
    selected,
    setCheckQuestionDatabase,
    setCurrentInput,
    setDifficulty,
    setPromptOpen,
    setRecognizability,
    setRuleSet,
    setScope,
    setSelected,
    show,
    targets,
    thinking,
  };
}

export { usePackageGeneration };
