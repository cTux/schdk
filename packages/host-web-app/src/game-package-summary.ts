import { QUESTIONS_PER_ROUND, type GamePackage } from '@schdk/common';
import type { HostPackageDetails } from '@schdk/ui/host';

export function summarizeGamePackage(
  gamePackage: GamePackage,
): Omit<HostPackageDetails, 'fileName'> {
  return {
    title: gamePackage.title,
    roundCount: Math.ceil(gamePackage.questions.length / QUESTIONS_PER_ROUND),
    questionCount: gamePackage.questions.length,
    handoutCount: gamePackage.questions.filter((question) => question.handout)
      .length,
  };
}
