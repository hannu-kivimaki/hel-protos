import { useState, useMemo, useCallback } from 'react';
import { IconAngleRight, IconArrowLeft } from 'hds-react';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  children?: NavItem[];
}

interface DrillDownNavigationProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  sectionTitle?: string;
  backHref?: string;
}

function findItem(items: NavItem[], id: string): NavItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParent(items: NavItem[], targetId: string, parent: NavItem | null = null): NavItem | null | undefined {
  for (const item of items) {
    if (item.id === targetId) return parent;
    if (item.children) {
      const found = findParent(item.children, targetId, item);
      if (found !== undefined) return found;
    }
  }
  return undefined; // not found
}

function getItemsAtFolder(items: NavItem[], folderId: string | null): NavItem[] {
  if (folderId === null) return items;
  const folder = findItem(items, folderId);
  return folder?.children ?? items;
}

type AnimationState = {
  isAnimating: boolean;
  direction: 'in' | 'out' | null;
  prevFolderId: string | null;
  prevItems: NavItem[];
};

export function DrillDownNavigation({
  items,
  activeId,
  onNavigate,
  sectionTitle = 'Navigaatio',
  backHref = '#',
}: DrillDownNavigationProps) {
  const [viewingFolderId, setViewingFolderId] = useState<string | null>(() => {
    const parent = findParent(items, activeId);
    return parent !== undefined ? (parent?.id ?? null) : null;
  });

  const [animation, setAnimation] = useState<AnimationState>({
    isAnimating: false,
    direction: null,
    prevFolderId: null,
    prevItems: [],
  });

  const currentItems = useMemo(() =>
    getItemsAtFolder(items, viewingFolderId),
    [items, viewingFolderId]
  );

  const currentFolder = useMemo(() =>
    viewingFolderId ? findItem(items, viewingFolderId) : null,
    [items, viewingFolderId]
  );

  const parentFolder = useMemo(() => {
    if (!viewingFolderId) return null;
    const parent = findParent(items, viewingFolderId);
    return parent !== undefined ? parent : null;
  }, [items, viewingFolderId]);


  const handleAnimationEnd = useCallback(() => {
    setAnimation({
      isAnimating: false,
      direction: null,
      prevFolderId: null,
      prevItems: [],
    });
  }, []);

  const drillInto = useCallback((folderId: string) => {
    if (animation.isAnimating) return;

    const prevItems = currentItems;
    setAnimation({
      isAnimating: true,
      direction: 'in',
      prevFolderId: viewingFolderId,
      prevItems,
    });
    setViewingFolderId(folderId);
  }, [animation.isAnimating, currentItems, viewingFolderId]);

  const goBack = useCallback(() => {
    if (animation.isAnimating || viewingFolderId === null) return;

    const prevItems = currentItems;
    const targetId = parentFolder?.id ?? null;
    setAnimation({
      isAnimating: true,
      direction: 'out',
      prevFolderId: viewingFolderId,
      prevItems,
    });
    setViewingFolderId(targetId);
  }, [animation.isAnimating, viewingFolderId, currentItems, parentFolder]);

  const handleNavigate = useCallback((id: string) => {
    if (!animation.isAnimating) onNavigate(id);
  }, [onNavigate, animation.isAnimating]);

  const handleDrillIn = useCallback((e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    drillInto(folderId);
  }, [drillInto]);

  const renderList = (listItems: NavItem[], isInteractive = true) => (
    <ul className="drilldown-list" role="list">
      {listItems.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const isActive = item.id === activeId;

        return (
          <li key={item.id} className="drilldown-item">
            <div className={`drilldown-row ${isActive ? 'drilldown-row--active' : ''}`}>
              <a
                href={item.href || `#${item.id}`}
                className="drilldown-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (isInteractive) handleNavigate(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={isInteractive ? 0 : -1}
              >
                <span className="drilldown-label">{item.label}</span>
              </a>
              {hasChildren && (
                <button
                  type="button"
                  className="drilldown-chevron"
                  onClick={(e) => isInteractive && handleDrillIn(e, item.id)}
                  aria-label={`Avaa ${item.label}`}
                  tabIndex={isInteractive ? 0 : -1}
                >
                  <span className="drilldown-chevron-icon">
                    <IconAngleRight size="m" aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  // Header shows where back button leads to (parent folder or section)
  const backTargetLabel = parentFolder?.label ?? sectionTitle;
  const showBackButton = viewingFolderId !== null;

  return (
    <nav className="drilldown" aria-label="Sivunavigaatio">
      {/* Header - shows back target (parent folder name) */}
      <div className="drilldown-header">
        {showBackButton ? (
          <>
            <button
              type="button"
              className="drilldown-back"
              onClick={goBack}
              aria-label={`Takaisin: ${backTargetLabel}`}
              disabled={animation.isAnimating}
            >
              <IconArrowLeft size="s" aria-hidden="true" />
            </button>
            <span className="drilldown-section-title">{backTargetLabel}</span>
          </>
        ) : (
          <>
            <a href={backHref} className="drilldown-back" aria-label={`Takaisin: ${sectionTitle}`}>
              <IconArrowLeft size="s" aria-hidden="true" />
            </a>
            <a href={backHref} className="drilldown-section-title">{sectionTitle}</a>
          </>
        )}
      </div>

      {/* Current page indicator - clickable to navigate to parent folder page */}
      <div className="drilldown-current-page">
        {currentFolder ? (
          <a
            href={`#${currentFolder.id}`}
            className="drilldown-current-label"
            onClick={(e) => {
              e.preventDefault();
              if (!animation.isAnimating) handleNavigate(currentFolder.id);
            }}
          >
            {currentFolder.label}
          </a>
        ) : (
          <a href={backHref} className="drilldown-current-label">{sectionTitle}</a>
        )}
      </div>

      {/* Navigation panels */}
      <div className="drilldown-viewport">
        {animation.isAnimating && animation.direction === 'in' && (
          // Drill in: old content slides out left
          <div className="drilldown-panel drilldown-panel--exit-left" aria-hidden="true">
            {renderList(animation.prevItems, false)}
          </div>
        )}

        {animation.isAnimating && animation.direction === 'out' && (
          // Drill out: old content slides out right
          <div className="drilldown-panel drilldown-panel--exit-right" aria-hidden="true">
            {renderList(animation.prevItems, false)}
          </div>
        )}

        {/* Current content */}
        <div
          className={`drilldown-panel drilldown-panel--current ${
            animation.isAnimating && animation.direction === 'in' ? 'drilldown-panel--enter-from-right' : ''
          }${
            animation.isAnimating && animation.direction === 'out' ? 'drilldown-panel--enter-from-left' : ''
          }`}
          onAnimationEnd={handleAnimationEnd}
        >
          {renderList(currentItems, !animation.isAnimating)}
        </div>
      </div>
    </nav>
  );
}
