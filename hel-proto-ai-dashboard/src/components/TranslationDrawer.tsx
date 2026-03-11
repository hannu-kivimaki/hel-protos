import { useState, useEffect, useRef } from 'react';
import { Dialog, Button, IconCheck, IconPen, Tabs, IconGlobe, IconInfoCircle, Notification, StatusLabel } from 'hds-react';
import type { TranslationTask, TranslationChunk } from '../data/mockTranslations';
import type { ContentItem, LangStatus } from '../types';
import styles from './TranslationDrawer.module.css';

// ⚠️ HDS React: Dialog – VAATII Drupal-sovituksen (Modal module tai custom)
// ✅ HDS Core: Button – Suoraan Drupalissa

interface ChunkRowProps {
  sourceText: string;
  sourceChanged?: boolean;
  chunk: TranslationChunk;
  editValue: string;
  isEditing: boolean;
  onEdit: () => void;
  onEditChange: (val: string) => void;
  onEditDone: () => void;
}

function ChunkRow({
  sourceText,
  sourceChanged,
  chunk,
  editValue,
  isEditing,
  onEdit,
  onEditChange,
  onEditDone,
}: ChunkRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const isMemory = chunk.status === 'from-memory';
  const isAiGenerated = chunk.status === 'ai-generated';

  return (
    <div className={`${styles.chunkRow} ${sourceChanged ? styles['chunkRow--changed'] : ''}`}>
      {/* Source chunk */}
      <div className={`${styles.sourceCell} ${sourceChanged ? styles['sourceCell--changed'] : ''}`}>
        {sourceChanged && (
          // ✅ HDS Core: StatusLabel – Suoraan Drupalissa
          <StatusLabel
            type="alert"
            iconLeft={<IconInfoCircle aria-hidden />}
            className={styles.changedLabel}
          >
            Muuttunut kohta
          </StatusLabel>
        )}
        <p className={styles.chunkText}>{sourceText}</p>
      </div>

      {/* Translation chunk */}
      <div className={`${styles.translationCell} ${chunk.isNew ? styles['translationCell--new'] : ''}`}>
        {chunk.isNew && isAiGenerated && (
          // ✅ HDS Core: StatusLabel – Suoraan Drupalissa
          <StatusLabel
            type="neutral"
            iconLeft={<IconGlobe aria-hidden />}
            className={styles.aiTag}
          >
            Tekoälykäännös
          </StatusLabel>
        )}
        {isMemory && chunk.memoryMatch && (
          <span className={styles.memoryTag}>
            <IconCheck aria-hidden className={styles.memoryTagIcon} />
            Käännösmuistista · {chunk.memoryMatch.confidence}% · {chunk.memoryMatch.sourcePageTitle}
          </span>
        )}

        {isEditing ? (
          <div className={styles.editArea}>
            <textarea
              ref={textareaRef}
              className={styles.editTextarea}
              value={editValue}
              onChange={(e) => {
                onEditChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              aria-label="Muokkaa käännöstä"
            />
            <Button
              variant="primary"
              size="small"
              onClick={onEditDone}
              className={styles.editDoneBtn}
            >
              Valmis
            </Button>
          </div>
        ) : (
          <div className={styles.chunkTextWrapper}>
            <p className={styles.chunkText}>{editValue || chunk.text}</p>
            <button
              className={styles.editChunkBtn}
              onClick={onEdit}
              aria-label="Muokkaa tätä käännöskohtaa"
              title="Muokkaa"
            >
              <IconPen aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TranslationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: TranslationTask | null;
  contentItem: ContentItem | null;
  initialLang?: string;
}

export function TranslationDrawer({
  isOpen,
  onClose,
  task,
  contentItem,
  initialLang,
}: TranslationDrawerProps) {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [accepted, setAccepted] = useState(false);

  const availableDrafts = task
    ? task.drafts.filter((d) => {
        if (!contentItem) return true;
        const status = contentItem.languages[d.lang] as LangStatus;
        return status === 'outdated' || status === 'missing';
      })
    : [];

  // Reset state when dialog opens or task changes
  useEffect(() => {
    if (isOpen) {
      setAccepted(false);
      setEditingChunkId(null);
      if (initialLang && availableDrafts.length > 0) {
        const idx = availableDrafts.findIndex((d) => d.lang === initialLang);
        setSelectedLangIndex(idx >= 0 ? idx : 0);
      } else {
        setSelectedLangIndex(0);
      }
    }
  }, [isOpen, initialLang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setEditValues({});
  }, [task]);

  const handleAccept = () => {
    setAccepted(true);
    setTimeout(onClose, 1200);
  };

  const currentDraft = availableDrafts[selectedLangIndex] ?? null;
  const isFullTranslation =
    currentDraft && contentItem
      ? contentItem.languages[currentDraft.lang] === 'missing'
      : false;

  const changesInDraft = currentDraft
    ? currentDraft.chunks.filter((c) => c.isNew).length
    : 0;

  const langAdjective: Record<string, string> = {
    sv: 'ruotsinkielinen',
    en: 'englanninkielinen',
  };


  return (
    // ⚠️ HDS React: Dialog – VAATII Drupal-sovituksen
    <Dialog
      id="translation-dialog"
      aria-labelledby="translation-dialog-title"
      isOpen={isOpen}
      close={onClose}
      closeButtonLabelText="Sulje käännösapuri"
      scrollable
      className={styles.dialog}
    >
      <Dialog.Header
        id="translation-dialog-title"
        title={task?.sourceTitle ?? contentItem?.title ?? 'Käännösapuri'}
      />

      <Dialog.Content>

        {/* Language tabs */}
        {availableDrafts.length > 1 && (
          // ⚠️ HDS React: Tabs – VAATII Drupal-sovituksen (custom JS)
          <div className={styles.langTabsWrapper}>
            <Tabs key={String(isOpen)} initiallyActiveTab={selectedLangIndex}>
              <Tabs.TabList>
                {availableDrafts.map((draft, i) => (
                  <Tabs.Tab
                    key={draft.lang}
                    onClick={() => {
                      setSelectedLangIndex(i);
                      setEditingChunkId(null);
                    }}
                  >
                    <IconGlobe aria-hidden className={styles.langFlag} />
                    {draft.langName}
                    <span
                      className={`${styles.langTabStatus} ${
                        contentItem?.languages[draft.lang] === 'missing'
                          ? styles['langTabStatus--missing']
                          : styles['langTabStatus--outdated']
                      }`}
                    >
                      {contentItem?.languages[draft.lang] === 'missing' ? 'puuttuu' : 'vanhentunut'}
                    </span>
                  </Tabs.Tab>
                ))}
              </Tabs.TabList>
            </Tabs>
          </div>
        )}
        {availableDrafts.length === 1 && currentDraft && (
          <div className={styles.singleLangLabel}>
            <IconGlobe aria-hidden className={styles.langFlag} />
            <strong>{currentDraft.langName}</strong>
            <span
              className={`${styles.langTabStatus} ${
                isFullTranslation
                  ? styles['langTabStatus--missing']
                  : styles['langTabStatus--outdated']
              }`}
            >
              {isFullTranslation ? 'puuttuu' : 'vanhentunut'}
            </span>
          </div>
        )}

        {/* AI status notification */}
        {/* ✅ HDS Core: Notification – Suoraan Drupalissa */}
        {currentDraft && (
          <Notification
            type="info"
            label={
              isFullTranslation
                ? 'Käännösehdotus on valmis tarkistettavaksi.'
                : `Käännösehdotukset on laadittu ${changesInDraft} muuttuneelle kohdalle.`
            }
            style={{ marginBottom: 'var(--spacing-m)' }}
          />
        )}

        {/* No task fallback */}
        {!task && (
          <div className={styles.noTask}>
            <div className={styles.noTaskIcon} aria-hidden>⏳</div>
            <h3>Käännösehdotus valmisteilla</h3>
            <p>Tekoäly analysoi tämän sivun muutoksia. Käännösehdotus on saatavilla pian.</p>
          </div>
        )}

        {/* Column headers + chunk rows */}
        {task && currentDraft && (
          <>
            <div className={styles.columnHeaders} aria-hidden>
              <div className={styles.colHeader}>
                <IconGlobe aria-hidden className={styles.colHeaderFlag} />
                <span>Suomi · lähde</span>
                <span className={styles.colHeaderMeta}>
                  Päivitetty {new Date(task.sourceLastModified).toLocaleDateString('fi-FI')}
                </span>
              </div>
              <div className={styles.colHeader}>
                <IconGlobe aria-hidden className={styles.colHeaderFlag} />
                <span>
                  {currentDraft.langName} · {isFullTranslation ? 'uusi käännös' : 'ehdotettu käännös'}
                </span>
                <span className={styles.colHeaderMeta}>
                  Päivitetty {new Date(
                    !isFullTranslation && currentDraft.translationLastModified
                      ? currentDraft.translationLastModified
                      : currentDraft.generatedAt
                  ).toLocaleDateString('fi-FI')}
                </span>
              </div>
            </div>

            <div className={styles.contentArea}>
              {task.sourceChunks.map((sourceChunk, i) => {
                const translationChunk = currentDraft.chunks[i];
                if (!translationChunk) return null;
                // Päivityskäännöksessä näytetään vain muuttuneet kohdat
                if (!isFullTranslation && !sourceChunk.changed) return null;
                const chunkEditId = translationChunk.id;
                const editVal =
                  editValues[chunkEditId] !== undefined
                    ? editValues[chunkEditId]
                    : translationChunk.text;

                return (
                  <ChunkRow
                    key={sourceChunk.id}
                    sourceText={sourceChunk.text}
                    sourceChanged={sourceChunk.changed}
                    chunk={translationChunk}
                    editValue={editVal}
                    isEditing={editingChunkId === chunkEditId}
                    onEdit={() => {
                      setEditingChunkId(chunkEditId);
                      if (editValues[chunkEditId] === undefined) {
                        setEditValues((prev) => ({ ...prev, [chunkEditId]: translationChunk.text }));
                      }
                    }}
                    onEditChange={(val) =>
                      setEditValues((prev) => ({ ...prev, [chunkEditId]: val }))
                    }
                    onEditDone={() => setEditingChunkId(null)}
                  />
                );
              })}
            </div>
          </>
        )}

      </Dialog.Content>

      <Dialog.ActionButtons className={styles.actionButtons}>
        {accepted ? (
          <div className={styles.acceptedState} role="status">
            <IconCheck aria-hidden className={styles.acceptedIcon} />
            <span>Käännös hyväksytty ja tallennettu!</span>
          </div>
        ) : (
          <>
            {/* ✅ HDS Core: Button (secondary) – Suoraan Drupalissa */}
            <Button
              variant="secondary"
              size="small"
              iconLeft={<IconPen aria-hidden />}
              onClick={onClose}
            >
              Avaa {langAdjective[currentDraft?.lang ?? ''] ?? `${currentDraft?.langName.toLowerCase()}kielinen`} versio
            </Button>
            <Button variant="primary" onClick={handleAccept} disabled={!currentDraft}>
              Hyväksy käännös
            </Button>
          </>
        )}
      </Dialog.ActionButtons>
    </Dialog>
  );
}
