import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function navigateToTutorialCreation(
  questionId: string,
  router: AppRouterInstance,
): void {
  const qs = new URLSearchParams({ question: questionId });
  router.push(`/tutorials/create?${qs.toString()}`);
}

export function tutorialCreationHref(questionId: string): string {
  const qs = new URLSearchParams({ question: questionId });
  return `/tutorials/create?${qs.toString()}`;
}
