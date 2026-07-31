import './styles.scss';

import {
  type SchdkDictionary,
  type SchdkDictionaryDistribution,
  type SchdkDictionaryItem,
} from '@schdk/common';
import { useEffect, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Textarea } from '../../atoms/Textarea';
import { useLocalization } from '../../localization';
import { DictionaryDistributionFields } from './DictionaryDistributionFields';
import { createDictionaryItem } from './utils/create-dictionary-item';
import { Page } from '../Page';
import type { DictionariesPageProps } from './types';

function DictionariesPage({
  dictionaries,
  editId,
  failed,
  hidden,
  isAdmin,
  loading,
  onCloseEditor,
  onBack,
  onShowEditor,
  onUpdate,
}: DictionariesPageProps) {
  const { copy } = useLocalization();
  const selected = dictionaries.find(({ id }) => id === editId);
  const [draft, setDraft] = useState<SchdkDictionary | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setDraft(selected ?? null);
    setSaveFailed(false);
  }, [selected]);

  function updateItem(index: number, patch: Partial<SchdkDictionaryItem>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
  }

  function updateDistribution(
    index: number,
    value: keyof SchdkDictionaryDistribution,
    percentage: number,
  ) {
    updateItem(index, {
      distribution: {
        ...draft?.items[index]?.distribution,
        [value]: percentage,
      } as SchdkDictionaryDistribution,
    });
  }

  function addItem() {
    setDraft((current) =>
      current
        ? {
            ...current,
            items: [
              ...current.items,
              createDictionaryItem(current.id.includes('distribution')),
            ],
          }
        : current,
    );
  }

  async function save() {
    if (!draft || !isAdmin) return;
    setSaving(true);
    setSaveFailed(!(await onUpdate(draft)));
    setSaving(false);
  }

  return (
    <Page
      className="dictionaries-page"
      headerActions={
        draft && isAdmin ? (
          <>
            <Button type="button" onClick={addItem} disabled={saving}>
              {copy.dictionaries.add}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={
                saving ||
                draft.items.some(
                  ({ name, description, promptPart, distribution }) =>
                    !name.trim() ||
                    !description.trim() ||
                    (!draft.id.includes('distribution') &&
                      !promptPart?.trim()) ||
                    (distribution &&
                      Object.values(distribution).reduce((a, b) => a + b, 0) !==
                        100),
                )
              }
              onClick={() => void save()}
            >
              {copy.dictionaries.save}
            </Button>
          </>
        ) : undefined
      }
      hidden={hidden}
      title={draft ? draft.name : copy.dictionaries.title}
      headerContent={
        <p>{draft ? draft.description : copy.dictionaries.description}</p>
      }
      onBack={draft ? onCloseEditor : onBack}
    >
      {draft ? (
        <>
          <div className="dictionaries-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{copy.dictionaries.name}</th>
                  <th>{copy.dictionaries.itemDescription}</th>
                  {!draft.id.includes('distribution') && (
                    <th>{copy.dictionaries.promptPart}</th>
                  )}
                  {draft.id.includes('distribution') && (
                    <th>{copy.dictionaries.distribution}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {draft.items.map((item, index) => (
                  <tr key={item.id ?? item.value}>
                    <td>
                      {isAdmin ? (
                        <Input
                          aria-label={copy.dictionaries.name}
                          value={item.name}
                          onChange={(event) =>
                            updateItem(index, { name: event.target.value })
                          }
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td>
                      {isAdmin ? (
                        <Textarea
                          aria-label={copy.dictionaries.itemDescription}
                          value={item.description}
                          onChange={(event) =>
                            updateItem(index, {
                              description: event.target.value,
                            })
                          }
                        />
                      ) : (
                        item.description
                      )}
                    </td>
                    {!draft.id.includes('distribution') && (
                      <td>
                        {isAdmin ? (
                          <Textarea
                            aria-label={copy.dictionaries.promptPart}
                            value={item.promptPart ?? ''}
                            onChange={(event) =>
                              updateItem(index, {
                                promptPart: event.target.value,
                              })
                            }
                          />
                        ) : (
                          item.promptPart
                        )}
                      </td>
                    )}
                    {draft.id.includes('distribution') && (
                      <td>
                        <DictionaryDistributionFields
                          item={item}
                          onChange={(value, percentage) =>
                            updateDistribution(index, value, percentage)
                          }
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {saveFailed && (
            <p className="dictionaries-error" role="alert">
              {copy.dictionaries.saveFailed}
            </p>
          )}
        </>
      ) : (
        <>
          {loading && <p role="status">{copy.dictionaries.loading}</p>}
          {failed && (
            <p className="dictionaries-error" role="alert">
              {copy.dictionaries.failed}
            </p>
          )}
          <div className="dictionaries-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{copy.dictionaries.name}</th>
                  <th>{copy.dictionaries.itemDescription}</th>
                </tr>
              </thead>
              <tbody>
                {dictionaries.map((dictionary) => (
                  <tr key={dictionary.id}>
                    <td>
                      <button
                        className="dictionary-link"
                        type="button"
                        onClick={() => onShowEditor(dictionary.id)}
                      >
                        {dictionary.name}
                      </button>
                    </td>
                    <td>{dictionary.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Page>
  );
}

export { DictionariesPage };
