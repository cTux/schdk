import * as common from '@schdk/common';
import { useEffect, useRef, useState } from 'react';
import { useConfirmationDialog } from '../../../atoms/ConfirmationDialog';
import { useLocalization } from '../../../localization';
import * as gen from '../utils/generation-input';
import type { PackageGenerationDialogProps } from '../types';

type PackageGenerationHookProps = Omit<
  PackageGenerationDialogProps,
  'generateQuestion'
>;

function usePackageGeneration({
  templates,
  packages,
  difficultyDistributions,
  recognizabilityDistributions,
  gamePackage,
  generatePackage,
  onGenerated,
  onGenerationStateChange,
  onSelectQuestion,
}: PackageGenerationHookProps) {
  const { copy } = useLocalization();
  const cancelDialog = useConfirmationDialog();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<gen.PackageGenerationScope>('missing');
  const [ruleSet, setRuleSet] =
    useState<gen.PackageGenerationRuleSet>('favorites');
  const [difficultyDistribution, setDifficultyDistribution] = useState(
    difficultyDistributions[1]?.id ?? difficultyDistributions[1]?.value ?? '',
  );
  const [currentDifficulty, setCurrentDifficulty] =
    useState<common.AIQuestionDifficulty>('medium');
  const [recognizability, setRecognizability] = useState(
    recognizabilityDistributions[1]?.id ??
      recognizabilityDistributions[1]?.value ??
      '',
  );
  const [currentRecognizability, setCurrentRecognizability] =
    useState<common.AIQuestionRecognizability>('easy');
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [excludedAnswers, setExcludedAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] =
    useState<gen.PackageGenerationInput | null>(null);
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
    setRuleSet('favorites');
    setDifficultyDistribution(
      difficultyDistributions[1]?.id ?? difficultyDistributions[1]?.value ?? '',
    );
    setCurrentDifficulty('medium');
    setRecognizability(
      recognizabilityDistributions[1]?.id ??
        recognizabilityDistributions[1]?.value ??
        '',
    );
    setCurrentRecognizability('easy');
    setSelected(null);
    setThinking(false);
    setFailed(false);
    setProgress(null);
    setPromptOpen(false);
    setExcludedAnswers([]);
    setCurrentInput(null);
    onGenerationStateChange([], false);
  }

  function show() {
    setSelected(activePackages.length ? 0 : null);
    setOpen(true);
    onGenerationStateChange([], true);
  }

  useEffect(() => () => void (generationId.current += 1), []);

  async function cancel() {
    if (await cancelDialog.confirm(copy.packageGeneration.cancelConfirmation)) {
      reset();
    }
  }

  async function generate() {
    const selectedDifficultyDistribution = difficultyDistributions.find(
      (item) => (item.id ?? item.value) === difficultyDistribution,
    )?.distribution;
    const selectedRecognizabilityDistribution =
      recognizabilityDistributions.find(
        (item) => (item.id ?? item.value) === recognizability,
      )?.distribution;
    const canGenerate =
      Boolean(selectedPackage) &&
      randomTemplates.length > 0 &&
      targets.length > 0 &&
      selectedDifficultyDistribution &&
      selectedRecognizabilityDistribution;
    if (!canGenerate) return;
    const currentGenerationId = ++generationId.current;
    onGenerationStateChange(targets, true);
    setThinking(true);
    setFailed(false);
    onSelectQuestion(targets[0]!);
    try {
      const steps = targets.map((index) => {
        const input = gen.getPackageGenerationInput(
          selectedPackage,
          templates,
          index,
          ruleSet,
          scope === 'commented' ? gamePackage.questions[index] : undefined,
        );
        if (!input) throw new Error('Missing generation input');
        return { index, ...input };
      });
      await generatePackage(
        {
          steps,
          excludedAnswers: initialExcludedAnswers,
          difficultyDistribution: selectedDifficultyDistribution,
          recognizabilityDistribution: selectedRecognizabilityDistribution,
        },
        ({ index, position, total, question, request }) => {
          setCurrentInput(request);
          setCurrentDifficulty(request.difficulty);
          setCurrentRecognizability(request.recognizability);
          setProgress([position, total]);
          setExcludedAnswers(request.excludedAnswers ?? []);
          onGenerated(
            index,
            scope === 'commented'
              ? { ...question, comment: undefined }
              : question,
          );
          onGenerationStateChange(targets.slice(position), true);
        },
        () => currentGenerationId === generationId.current,
      );
      if (currentGenerationId !== generationId.current) return;
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
    currentDifficulty,
    currentRecognizability,
    difficultyDistribution,
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
    recognizabilityDistributions,
    difficultyDistributions,
    reset,
    ruleSet,
    scope,
    selected,
    setCurrentInput,
    setDifficultyDistribution,
    setRecognizabilityDistribution: setRecognizability,
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
