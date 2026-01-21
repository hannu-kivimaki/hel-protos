import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { IconAngleDown, IconArrowLeft, IconMenuHamburger, IconCross } from 'hds-react';

// ⚠️ Custom SideNavigation - VAATII Drupal-sovituksen
// World-class implementation with refined Nordic minimalism
// Features: sliding active indicator, spring animations, staggered reveals

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  children?: NavItem[];
}

interface SideNavigationProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  sectionTitle?: string;
  backHref?: string;
  backLabel?: string;
  toggleLabel?: string;
}

/** Find path from root to target item */
function getPathToItem(items: NavItem[], targetId: string, path: string[] = []): string[] {
  for (const item of items) {
    if (item.id === targetId) {
      return [...path, item.id];
    }
    if (item.children) {
      const found = getPathToItem(item.children, targetId, [...path, item.id]);
      if (found.length > 0) return found;
    }
  }
  return [];
}

export function SideNavigation({
  items,
  activeId,
  onNavigate,
  sectionTitle = 'Navigaatio',
  backHref = '#',
  backLabel = 'Takaisin',
  toggleLabel = 'Valikko',
}: SideNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, left: 0, height: 0, opacity: 0 });
  const [indicatorTransition, setIndicatorTransition] = useState(true);

  const activePath = useMemo(() => {
    return getPathToItem(items, activeId);
  }, [items, activeId]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ancestors = activePath.slice(0, -1);
    return new Set(ancestors);
  });

  // Update indicator position - tracks active element using RAF for smooth following
  const updateIndicator = useCallback((targetId: string) => {
    if (!navRef.current) return;

    const targetRow = navRef.current.querySelector(`[data-sidenav-row-id="${targetId}"]`);
    if (!targetRow) return;

    const navRect = navRef.current.getBoundingClientRect();
    const rowRect = targetRow.getBoundingClientRect();
    const level = Number((targetRow as HTMLElement).dataset.sidenavLevel ?? 0);
    const indent = Math.max(0, level) * 16;
    setIndicatorStyle({
      top: rowRect.top - navRect.top,
      left: rowRect.left - navRect.left + indent,
      height: rowRect.height,
      opacity: 1,
    });
  }, []);

  const isActiveCollapsed = useMemo(() => {
    const ancestors = activePath.slice(0, -1);
    return ancestors.some(id => !expandedIds.has(id));
  }, [activePath, expandedIds]);

  useEffect(() => {
    if (isActiveCollapsed) return;
    const timer = setTimeout(() => updateIndicator(activeId), 20);
    return () => clearTimeout(timer);
  }, [activeId, isActiveCollapsed, updateIndicator]);

  // On expandedIds change: continuously track position during animation
  useEffect(() => {
    const animationDuration = 300; // Slightly longer than CSS to ensure completion
    const startTime = performance.now();
    let rafId: number;

    // Disable transition during tracking for smooth following
    setIndicatorTransition(false);

    const trackPosition = () => {
      if (!isActiveCollapsed) {
        updateIndicator(activeId);
      }

      // Keep tracking until animation is complete
      if (performance.now() - startTime < animationDuration) {
        rafId = requestAnimationFrame(trackPosition);
      } else {
        // Re-enable transition after animation
        setIndicatorTransition(true);
      }
    };

    rafId = requestAnimationFrame(trackPosition);
    return () => {
      cancelAnimationFrame(rafId);
      setIndicatorTransition(true);
    };
  }, [expandedIds, activeId, isActiveCollapsed, updateIndicator]);

  useEffect(() => {
    const ancestors = activePath.slice(0, -1);
    if (ancestors.length > 0) {
      setExpandedIds(prev => {
        const next = new Set(prev);
        ancestors.forEach(id => next.add(id));
        return next;
      });
    }
  }, [activePath]);

  const handleNavigate = useCallback((id: string) => {
    onNavigate(id);
    setIsOpen(false);
  }, [onNavigate]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isInActivePath = useCallback((id: string) => {
    return activePath.includes(id) && id !== activeId;
  }, [activePath, activeId]);

  const renderItems = (navItems: NavItem[], level: number) => {
    return (
      <ul className={`sidenav-list sidenav-list--level-${level}`} role="list">
        {navItems.map((item, index) => {
          const hasChildren = Boolean(item.children?.length);
          const isActive = item.id === activeId;
          const isExpanded = expandedIds.has(item.id);
          const isAncestor = isInActivePath(item.id);
          const isCollapsedActiveAncestor = isAncestor && !isExpanded;

          const itemClasses = [
            'sidenav-item',
            isActive && 'sidenav-item--active',
            isAncestor && 'sidenav-item--ancestor',
            isCollapsedActiveAncestor && 'sidenav-item--active-ancestor',
          ].filter(Boolean).join(' ');

          return (
            <li
              key={item.id}
              className={itemClasses}
              style={{ '--item-index': index } as React.CSSProperties}
            >
              <div
                className="sidenav-row"
                data-sidenav-row-id={item.id}
                data-sidenav-level={level}
                style={{ '--sidenav-indent': `${level * 16}px` } as React.CSSProperties}
              >
                {/* All items are navigable links */}
                <a
                  href={item.href || `#${item.id}`}
                  className={`sidenav-link ${hasChildren ? 'sidenav-link--parent' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate(item.id);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="sidenav-label">{item.label}</span>
                </a>
                {/* Separate toggle button for items with children */}
                {hasChildren && (
                  <button
                    type="button"
                    className={`sidenav-toggle ${isExpanded ? 'sidenav-toggle--expanded' : ''}`}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Sulje' : 'Avaa'} ${item.label}`}
                    onClick={() => toggleExpand(item.id)}
                  >
                    <span className="sidenav-toggle-icon">
                      <IconAngleDown size="m" aria-hidden="true" />
                    </span>
                  </button>
                )}
              </div>
              {hasChildren && (
                <div
                  className={`sidenav-submenu ${isExpanded ? 'sidenav-submenu--open' : ''}`}
                  style={{ '--sidenav-parent-indent': `${level * 16}px` } as React.CSSProperties}
                >
                  {renderItems(item.children!, level + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidenav-backdrop ${isOpen ? 'sidenav-backdrop--visible' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <nav
        ref={navRef}
        className={`sidenav ${isOpen ? 'sidenav--open' : ''}`}
        aria-label="Sivunavigaatio"
      >
        {/* Sliding active indicator */}
        <div
          className={`sidenav-indicator ${indicatorTransition ? '' : 'sidenav-indicator--no-transition'}`}
          style={{
            transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
            height: indicatorStyle.height,
            opacity: isActiveCollapsed ? 0 : indicatorStyle.opacity,
          }}
          aria-hidden="true"
        />

        {/* Mobile toggle */}
        <button
          type="button"
          className="sidenav-mobile-toggle"
          aria-expanded={isOpen}
          aria-controls="sidenav-content"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sidenav-mobile-toggle-icon">
            {isOpen ? (
              <IconCross size="m" aria-hidden="true" />
            ) : (
              <IconMenuHamburger size="m" aria-hidden="true" />
            )}
          </span>
          <span className="sidenav-mobile-toggle-text">
            {isOpen ? 'Sulje valikko' : toggleLabel}
          </span>
        </button>

        {/* Navigation content */}
        <div id="sidenav-content" className="sidenav-content">
          {/* Header */}
          <div className="sidenav-header">
            <a href={backHref} className="sidenav-back" aria-label={`${backLabel}: ${sectionTitle}`}>
              <IconArrowLeft size="s" aria-hidden="true" />
            </a>
            <a href={backHref} className="sidenav-section-title">{sectionTitle}</a>
          </div>

          {/* Navigation tree */}
          {renderItems(items, 0)}
        </div>
      </nav>
    </>
  );
}
