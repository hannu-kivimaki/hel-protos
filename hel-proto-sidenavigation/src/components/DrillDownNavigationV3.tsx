import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconAngleRight, IconAngleDown, IconArrowLeft, IconCross } from 'hds-react';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  children?: NavItem[];
}

interface DrillDownNavigationV3Props {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  sectionTitle?: string;
  backHref?: string;
  baseUrl?: string;
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
  return undefined;
}

function getItemsAtFolder(items: NavItem[], folderId: string | null): NavItem[] {
  if (folderId === null) return items;
  const folder = findItem(items, folderId);
  return folder?.children ?? items;
}

// Find the path to an item (for deep linking)
function findPath(items: NavItem[], targetId: string, path: string[] = []): string[] | null {
  for (const item of items) {
    if (item.id === targetId) return path;
    if (item.children) {
      const found = findPath(item.children, targetId, [...path, item.id]);
      if (found) return found;
    }
  }
  return null;
}

type AnimationState = {
  isAnimating: boolean;
  direction: 'in' | 'out' | null;
  prevFolderId: string | null;
  prevItems: NavItem[];
};

export function DrillDownNavigationV3({
  items,
  activeId,
  onNavigate,
  sectionTitle = 'Navigaatio',
  backHref = '#',
  baseUrl = '/v3',
}: DrillDownNavigationV3Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll position storage per folder
  const scrollPositions = useRef<Map<string | null, number>>(new Map());
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const backButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // Live region for screen reader announcements
  const [announcement, setAnnouncement] = useState('');

  // Header crossfade animation
  const [headerAnimation, setHeaderAnimation] = useState<'in' | 'out' | null>(null);
  const [prevHeaderTitle, setPrevHeaderTitle] = useState<string | null>(null);

  // Recently visited pages (persisted in sessionStorage)
  const RECENT_STORAGE_KEY = 'drilldown-recent';
  const RECENT_COLLAPSED_KEY = 'drilldown-recent-collapsed';
  const MAX_RECENT = 3;

  const [recentlyVisited, setRecentlyVisited] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem(RECENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentCollapsed, setRecentCollapsed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(RECENT_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleRecentCollapsed = useCallback(() => {
    setRecentCollapsed(prev => {
      const next = !prev;
      try {
        sessionStorage.setItem(RECENT_COLLAPSED_KEY, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Add to recently visited when navigating
  const addToRecent = useCallback((id: string) => {
    setRecentlyVisited(prev => {
      const filtered = prev.filter(item => item !== id);
      const updated = [id, ...filtered].slice(0, MAX_RECENT);
      try {
        sessionStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  // Remove from recently visited
  const removeFromRecent = useCallback((id: string) => {
    setRecentlyVisited(prev => {
      const updated = prev.filter(item => item !== id);
      try {
        sessionStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  // Parse folder from URL on mount
  const getInitialFolder = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const folder = params.get('folder');
    if (folder) return folder;

    // Default: find parent of active item
    const parent = findParent(items, activeId);
    return parent !== undefined ? (parent?.id ?? null) : null;
  }, [items, activeId, location.search]);

  const [viewingFolderId, setViewingFolderId] = useState<string | null>(getInitialFolder);

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


  // URL synchronization
  const updateUrl = useCallback((folderId: string | null, pageId?: string) => {
    const params = new URLSearchParams();
    if (folderId) params.set('folder', folderId);
    if (pageId) params.set('page', pageId);
    const search = params.toString();
    navigate(`${baseUrl}${search ? '?' + search : ''}`, { replace: true });
  }, [navigate, baseUrl]);

  // Sync URL when folder changes
  useEffect(() => {
    updateUrl(viewingFolderId, activeId);
  }, [viewingFolderId, activeId, updateUrl]);

  // Handle deep linking on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageId = params.get('page');
    const folderId = params.get('folder');

    if (pageId && pageId !== activeId) {
      // Navigate to the page specified in URL
      onNavigate(pageId);

      // Find and set the correct folder
      const path = findPath(items, pageId);
      if (path && path.length > 0) {
        setViewingFolderId(path[path.length - 1]);
      } else {
        const parent = findParent(items, pageId);
        setViewingFolderId(parent?.id ?? null);
      }
    } else if (folderId) {
      setViewingFolderId(folderId);
    }
  }, []); // Only on mount

  // Save scroll position before navigation
  const saveScrollPosition = useCallback(() => {
    if (viewportRef.current) {
      scrollPositions.current.set(viewingFolderId, viewportRef.current.scrollTop);
    }
  }, [viewingFolderId]);

  // Restore scroll position after animation
  const restoreScrollPosition = useCallback((folderId: string | null) => {
    requestAnimationFrame(() => {
      if (viewportRef.current) {
        const saved = scrollPositions.current.get(folderId) ?? 0;
        viewportRef.current.scrollTop = saved;
      }
    });
  }, []);

  // Focus management: focus first item when drilling in
  const focusFirstItem = useCallback(() => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        const firstLink = listRef.current.querySelector('.drilldown-v3-link') as HTMLElement;
        firstLink?.focus();
      }
    });
  }, []);

  // Focus management: focus back button when drilling out
  const focusBackButton = useCallback(() => {
    requestAnimationFrame(() => {
      if (backButtonRef.current) {
        backButtonRef.current.focus();
      }
    });
  }, []);

  // Announce navigation for screen readers
  const announce = useCallback((message: string) => {
    setAnnouncement('');
    requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  }, []);

  const handleAnimationEnd = useCallback(() => {
    const wasDirection = animation.direction;
    const targetFolderId = viewingFolderId;

    setAnimation({
      isAnimating: false,
      direction: null,
      prevFolderId: null,
      prevItems: [],
    });

    // Restore scroll and manage focus after animation completes
    restoreScrollPosition(targetFolderId);

    if (wasDirection === 'in') {
      focusFirstItem();
    } else if (wasDirection === 'out') {
      focusBackButton();
    }
  }, [animation.direction, viewingFolderId, restoreScrollPosition, focusFirstItem, focusBackButton]);

  const drillInto = useCallback((folderId: string) => {
    if (animation.isAnimating) return;

    saveScrollPosition();

    const folder = findItem(items, folderId);
    const childCount = folder?.children?.length ?? 0;
    announce(`Avattu ${folder?.label}, ${childCount} kohdetta`);

    // Trigger header crossfade
    const currentTitle = parentFolder?.label ?? sectionTitle;
    setPrevHeaderTitle(currentTitle);
    setHeaderAnimation('in');

    const prevItems = currentItems;
    setAnimation({
      isAnimating: true,
      direction: 'in',
      prevFolderId: viewingFolderId,
      prevItems,
    });
    setViewingFolderId(folderId);
  }, [animation.isAnimating, currentItems, viewingFolderId, items, saveScrollPosition, announce, parentFolder, sectionTitle]);

  const goBack = useCallback(() => {
    if (animation.isAnimating || viewingFolderId === null) return;

    saveScrollPosition();

    const targetLabel = parentFolder?.label ?? sectionTitle;
    const targetItems = parentFolder
      ? parentFolder.children?.length ?? 0
      : items.length;
    announce(`Takaisin: ${targetLabel}, ${targetItems} kohdetta`);

    // Trigger header crossfade
    const currentTitle = currentFolder?.label ?? sectionTitle;
    setPrevHeaderTitle(currentTitle);
    setHeaderAnimation('out');

    const prevItems = currentItems;
    const targetId = parentFolder?.id ?? null;
    setAnimation({
      isAnimating: true,
      direction: 'out',
      prevFolderId: viewingFolderId,
      prevItems,
    });
    setViewingFolderId(targetId);
  }, [animation.isAnimating, viewingFolderId, currentItems, parentFolder, currentFolder, items.length, sectionTitle, saveScrollPosition, announce]);

  const handleNavigate = useCallback((id: string) => {
    if (!animation.isAnimating) {
      const item = findItem(items, id);
      announce(`Siirrytty sivulle: ${item?.label}`);
      addToRecent(id);
      onNavigate(id);
    }
  }, [onNavigate, animation.isAnimating, items, announce, addToRecent]);

  const handleDrillIn = useCallback((e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    drillInto(folderId);
  }, [drillInto]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && viewingFolderId !== null) {
      e.preventDefault();
      goBack();
    }
  }, [viewingFolderId, goBack]);

  // Swipe gesture handlers
  const SWIPE_THRESHOLD = 80;
  const SWIPE_VELOCITY_THRESHOLD = 0.3;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (viewingFolderId === null || animation.isAnimating) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, [viewingFolderId, animation.isAnimating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (viewingFolderId === null || animation.isAnimating) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Only track horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaY) > Math.abs(deltaX) && swipeOffset === 0) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    // Only allow right swipe (positive deltaX) for going back
    if (deltaX > 0) {
      setSwipeOffset(Math.min(deltaX, 150));
    }
  }, [viewingFolderId, animation.isAnimating, swipeOffset]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) {
      setSwipeOffset(0);
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const velocity = deltaX / 200; // rough velocity estimate

    // Trigger back if swipe exceeds threshold or has enough velocity
    if (deltaX > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      if (viewingFolderId !== null && !animation.isAnimating) {
        goBack();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setSwipeOffset(0);
  }, [viewingFolderId, animation.isAnimating, goBack]);

  const renderList = (listItems: NavItem[], isInteractive = true, isEntering = false) => (
    <ul
      className="drilldown-v3-list"
      role="list"
      ref={isInteractive ? listRef : undefined}
    >
      {listItems.map((item, index) => {
        const hasChildren = Boolean(item.children?.length);
        const isActive = item.id === activeId;

        return (
          <li
            key={item.id}
            className={`drilldown-v3-item ${isEntering ? 'drilldown-v3-item--entering' : ''}`}
            style={{ '--item-index': index } as React.CSSProperties}
          >
            <div className={`drilldown-v3-row ${isActive ? 'drilldown-v3-row--active' : ''}`}>
              <a
                href={item.href || `#${item.id}`}
                className="drilldown-v3-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (isInteractive) handleNavigate(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={isInteractive ? 0 : -1}
              >
                <span className="drilldown-v3-label">{item.label}</span>
              </a>
              {hasChildren && (
                <button
                  type="button"
                  className="drilldown-v3-chevron"
                  onClick={(e) => isInteractive && handleDrillIn(e, item.id)}
                  aria-label={`Avaa ${item.label}`}
                  tabIndex={isInteractive ? 0 : -1}
                >
                  <span className="drilldown-v3-chevron-icon">
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

  const backTargetLabel = parentFolder?.label ?? sectionTitle;
  const showBackButton = viewingFolderId !== null;

  const handleHeaderAnimationEnd = useCallback(() => {
    setHeaderAnimation(null);
    setPrevHeaderTitle(null);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`drilldown-v3 ${swipeOffset > 0 ? 'drilldown-v3--swiping' : ''} ${viewingFolderId !== null ? 'drilldown-v3--can-swipe' : ''}`}
      aria-label="Sivunavigaatio"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={swipeOffset > 0 ? { '--swipe-offset': `${swipeOffset}px` } as React.CSSProperties : undefined}
    >
      {/* Live region for screen reader announcements */}
      <div
        className="drilldown-v3-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      {/* Header */}
      <div className="drilldown-v3-header">
        {showBackButton ? (
          <>
            <button
              type="button"
              className="drilldown-v3-back"
              onClick={goBack}
              aria-label={`Takaisin: ${backTargetLabel}`}
              disabled={animation.isAnimating}
              ref={backButtonRef as React.RefObject<HTMLButtonElement>}
            >
              <IconArrowLeft size="s" aria-hidden="true" />
            </button>
            <div className="drilldown-v3-header-title-wrap">
              {headerAnimation && prevHeaderTitle && (
                <span
                  className={`drilldown-v3-section-title drilldown-v3-section-title--exit-${headerAnimation}`}
                  aria-hidden="true"
                >
                  {prevHeaderTitle}
                </span>
              )}
              <a
                href="#"
                className={`drilldown-v3-section-title ${headerAnimation ? `drilldown-v3-section-title--enter-${headerAnimation}` : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  goBack();
                }}
                onAnimationEnd={handleHeaderAnimationEnd}
              >
                {backTargetLabel}
              </a>
            </div>
          </>
        ) : (
          <>
            <a
              href={backHref}
              className="drilldown-v3-back"
              aria-label={`Takaisin: ${sectionTitle}`}
              ref={backButtonRef as React.RefObject<HTMLAnchorElement>}
            >
              <IconArrowLeft size="s" aria-hidden="true" />
            </a>
            <div className="drilldown-v3-header-title-wrap">
              {headerAnimation && prevHeaderTitle && (
                <span
                  className={`drilldown-v3-section-title drilldown-v3-section-title--exit-${headerAnimation}`}
                  aria-hidden="true"
                >
                  {prevHeaderTitle}
                </span>
              )}
              <a
                href={backHref}
                className={`drilldown-v3-section-title ${headerAnimation ? `drilldown-v3-section-title--enter-${headerAnimation}` : ''}`}
                onAnimationEnd={handleHeaderAnimationEnd}
              >
                {sectionTitle}
              </a>
            </div>
          </>
        )}
      </div>

      {/* Current page indicator */}
      <div className="drilldown-v3-current-page">
        {currentFolder ? (
          <a
            href={`#${currentFolder.id}`}
            className="drilldown-v3-current-label"
            onClick={(e) => {
              e.preventDefault();
              if (!animation.isAnimating) handleNavigate(currentFolder.id);
            }}
          >
            {currentFolder.label}
          </a>
        ) : (
          <a href={backHref} className="drilldown-v3-current-label">{sectionTitle}</a>
        )}
      </div>

      {/* Navigation panel - no exit panels, just instant swap with cascade */}
      <div className="drilldown-v3-viewport" ref={viewportRef}>
        <div
          key={viewingFolderId ?? 'root'}
          className={`drilldown-v3-panel drilldown-v3-panel--current ${
            animation.isAnimating && animation.direction === 'in' ? 'drilldown-v3-panel--enter-from-right' : ''
          }${
            animation.isAnimating && animation.direction === 'out' ? 'drilldown-v3-panel--enter-from-left' : ''
          }`}
          onAnimationEnd={handleAnimationEnd}
        >
          {renderList(
            currentItems,
            !animation.isAnimating,
            animation.isAnimating
          )}
        </div>
      </div>

      {/* Recently visited */}
      {recentlyVisited.filter(id => id !== activeId).length > 0 && (
        <div className="drilldown-v3-recent">
          <button
            type="button"
            className="drilldown-v3-recent-header"
            onClick={toggleRecentCollapsed}
            aria-expanded={!recentCollapsed}
          >
            <span className={`drilldown-v3-recent-icon ${recentCollapsed ? 'drilldown-v3-recent-icon--collapsed' : ''}`}>
              <IconAngleDown size="s" aria-hidden="true" />
            </span>
            <span>Äskettäin katsotut</span>
          </button>
          {!recentCollapsed && (
            <ul className="drilldown-v3-recent-list">
              {recentlyVisited
                .filter(id => id !== activeId)
                .slice(0, MAX_RECENT)
                .map((id, index) => {
                  const item = findItem(items, id);
                  if (!item) return null;
                  return (
                    <li
                      key={id}
                      className="drilldown-v3-recent-item"
                      style={{ '--recent-index': index } as React.CSSProperties}
                    >
                      <div className="drilldown-v3-recent-row">
                        <a
                          href={`#${id}`}
                          className="drilldown-v3-recent-link"
                          onClick={(e) => {
                            e.preventDefault();
                            const parent = findParent(items, id);
                            if (parent !== undefined) {
                              setViewingFolderId(parent?.id ?? null);
                            }
                            handleNavigate(id);
                          }}
                        >
                          {item.label}
                        </a>
                        <button
                          type="button"
                          className="drilldown-v3-recent-remove"
                          onClick={() => removeFromRecent(id)}
                          aria-label={`Poista ${item.label} äskettäin katsotuista`}
                        >
                          <IconCross size="s" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      )}
    </nav>
  );
}
