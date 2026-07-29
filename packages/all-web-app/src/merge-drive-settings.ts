import {
  isDriveFileId,
  type DriveSettingsDocument,
  type TimedSection,
} from '@schdk/google-drive';
import type { EditorTextOptions, GameOptions } from '@schdk/ui/options';
import { normalizeEditorTextOptions } from './editor-options-storage';
import { normalizeGameOptions } from './game-options-validation';

function newerValidSection<T>(
  local: TimedSection<T>,
  remote: TimedSection,
  normalize: (value: unknown) => T | null,
): TimedSection<T> {
  const remoteValue = normalize(remote.value);
  return remoteValue &&
    Date.parse(remote.updatedAt) > Date.parse(local.updatedAt)
    ? { updatedAt: remote.updatedAt, value: remoteValue }
    : local;
}

export function mergeDriveSettings(
  local: DriveSettingsDocument,
  remoteValue: unknown,
): DriveSettingsDocument {
  if (!remoteValue || typeof remoteValue !== 'object') return local;
  const candidate = remoteValue as Record<string, unknown>;
  if (
    candidate.schemaVersion !== 1 ||
    !candidate.sections ||
    typeof candidate.sections !== 'object'
  ) {
    return local;
  }
  const sections = candidate.sections as Record<string, unknown>;
  const readSection = (name: string): TimedSection | null => {
    const value = sections[name];
    if (!value || typeof value !== 'object') return null;
    const section = value as Record<string, unknown>;
    return typeof section.updatedAt === 'string' &&
      Number.isFinite(Date.parse(section.updatedAt)) &&
      'value' in section
      ? { updatedAt: section.updatedAt, value: section.value }
      : null;
  };
  const remoteEditor = readSection('editorTextOptions');
  const remoteGame = readSection('gameOptions');
  const remoteRecents = readSection('recentPackages');
  const validRemoteRecents =
    remoteRecents &&
    Array.isArray(remoteRecents.value) &&
    remoteRecents.value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        isDriveFileId((item as Record<string, unknown>).fileId) &&
        typeof (item as Record<string, unknown>).openedAt === 'string' &&
        Number.isFinite(
          Date.parse((item as Record<string, unknown>).openedAt as string),
        ),
    )
      ? (remoteRecents as typeof local.sections.recentPackages)
      : null;
  return {
    schemaVersion: 1,
    packageFolderId: isDriveFileId(candidate.packageFolderId)
      ? candidate.packageFolderId
      : local.packageFolderId,
    sections: {
      editorTextOptions: remoteEditor
        ? newerValidSection(
            local.sections.editorTextOptions as TimedSection<EditorTextOptions>,
            remoteEditor,
            normalizeEditorTextOptions,
          )
        : local.sections.editorTextOptions,
      gameOptions: remoteGame
        ? newerValidSection(
            local.sections.gameOptions as TimedSection<GameOptions>,
            remoteGame,
            normalizeGameOptions,
          )
        : local.sections.gameOptions,
      recentPackages:
        validRemoteRecents &&
        Date.parse(validRemoteRecents.updatedAt) >
          Date.parse(local.sections.recentPackages.updatedAt)
          ? validRemoteRecents
          : local.sections.recentPackages,
    },
  };
}
