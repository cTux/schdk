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
import type { DictionariesPageProps } from './types';

function DictionariesPage({
  dictionaries,
  editId,
  failed,
  hidden,
  isAdmin,
  loading,
  onCloseEditor,
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
    <section className="dictionaries-page" hidden={hidden}>
      {draft ? (
        <>
          <header>
            <div>
              <h1>{draft.name}</h1>
              <p>{draft.description}</p>
            </div>
            <Button type="button" onClick={onCloseEditor}>
              {copy.shared.back}
            </Button>
          </header>
          <div className="dictionaries-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{copy.dictionaries.name}</th>
                  <th>{copy.dictionaries.itemDescription}</th>
                  <th>{copy.dictionaries.promptPart}</th>
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
                    <td>
                      {isAdmin ? (
                        <Textarea
                          aria-label={copy.dictionaries.promptPart}
                          value={item.promptPart}
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
          {isAdmin && (
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
                      !promptPart.trim() ||
                      (distribution &&
                        Object.values(distribution).reduce(
                          (a, b) => a + b,
                          0,
                        ) !== 100),
                  )
                }
                onClick={() => void save()}
              >
                {copy.dictionaries.save}
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <h1>{copy.dictionaries.title}</h1>
          <p>{copy.dictionaries.description}</p>
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
    </section>
  );
}

export { DictionariesPage };
