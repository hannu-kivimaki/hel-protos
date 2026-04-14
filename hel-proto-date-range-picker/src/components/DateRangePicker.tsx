import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange as RdpDateRange, CaptionProps } from 'react-day-picker';
import { format, parse, isValid, addMonths, subMonths, startOfMonth } from 'date-fns';
import { fi as fiFns, sv as svFns, enGB as enFns } from 'date-fns/locale';
import { Button, ButtonSize, ButtonVariant, IconCalendar, IconCheck, IconCross, IconCrossCircle, IconAngleLeft, IconAngleRight, IconErrorFill } from 'hds-react';
import 'react-day-picker/dist/style.css';
import './DateRangePicker.css';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface PresetRange {
  label: string;
  getRange: () => { startDate: Date; endDate: Date };
}

export interface DateRangePickerProps {
  id: string;
  label: string;
  language?: 'fi' | 'sv' | 'en';
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  presetRanges?: PresetRange[];
  required?: boolean;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  /** Range highlight color scheme. 'bus' = #f0f0ff (sininen), 'black' = #e6e6e6 (harmaa). */
  colorScheme?: 'bus' | 'black';
  /** Override which month the calendar opens on. Defaults to the start of the selected range, or the current month. */
  defaultMonth?: Date;
}

const DATE_FORMAT = 'd.M.yyyy';

const localeMap = { fi: fiFns, sv: svFns, en: enFns };

/** "Valittu ajankohta: 25.3.2026–28.3.2026" tai "Valitse alkupäivä" jos ei valintaa */
function getPhaseLabel(
  pendingRange: RdpDateRange | undefined,
  selectionLabel: string,
  phaseStart: string,
): string {
  const from = pendingRange?.from;
  const to = pendingRange?.to;
  if (!from) return phaseStart;
  const fromStr = format(from, DATE_FORMAT);
  if (!to) return `${selectionLabel}: ${fromStr} –`;
  return `${selectionLabel}: ${fromStr} – ${format(to, DATE_FORMAT)}`;
}

/** "Maaliskuu–Huhtikuu 2026" tai "Joulukuu 2025–Tammikuu 2026" */
function getCombinedMonthLabel(first: Date, second: Date, locale: (typeof localeMap)[keyof typeof localeMap]): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const m1 = cap(format(first, 'LLLL', { locale }));
  const m2 = cap(format(second, 'LLLL', { locale }));
  const y1 = first.getFullYear();
  const y2 = second.getFullYear();
  return y1 === y2 ? `${m1}–${m2} ${y1}` : `${m1} ${y1}–${m2} ${y2}`;
}

const t = {
  fi: {
    startLabel: 'Alkupäivä',
    endLabel: 'Loppupäivä',
    startPlaceholder: 'pp.kk.vvvv',
    endPlaceholder: 'pp.kk.vvvv',
    openButton: 'Avaa kalenteri',
    closeCalendarButton: 'Sulje kalenteri',
    dialogLabel: 'Päivämäärävälin valitsin',
    phaseStart: 'Valitse alkupäivä',
    phaseEnd: 'Valitse loppupäivä',
    selectionLabel: 'Valittu ajankohta',
    openAnnounceStart: 'Kalenteri avattu. Valitse alkupäivä nuolinäppäimillä.',
    openAnnounceEnd: (d: string) => `Kalenteri avattu. Alkupäivä on ${d}. Valitse loppupäivä.`,
    announceStart: (d: string) => `Alkupäivä valittu: ${d}. Valitse seuraavaksi loppupäivä.`,
    announceNewStart: (d: string) => `Uusi alkupäivä: ${d}. Aiempi valinta tyhjennetty. Valitse loppupäivä.`,
    announceEnd: (d: string) => `Loppupäivä valittu: ${d}.`,
    confirmButton: 'Vahvista valinta',
    closeButton: 'Sulje vahvistamatta',
    clearButton: 'Tyhjennä valinta',
    prevMonth: 'Edellinen kuukausi',
    nextMonth: 'Seuraava kuukausi',
    separator: '–',
    requiredText: 'pakollinen kenttä',
    presetRangesLabel: 'Pikavalinnat',
    formatHint: 'Syötä päivämäärät muodossa pp.kk.vvvv',
  },
  sv: {
    startLabel: 'Startdatum',
    endLabel: 'Slutdatum',
    startPlaceholder: 'dd.mm.åååå',
    endPlaceholder: 'dd.mm.åååå',
    openButton: 'Öppna kalender',
    closeCalendarButton: 'Stäng kalender',
    dialogLabel: 'Datumintervallväljare',
    phaseStart: 'Välj startdatum',
    phaseEnd: 'Välj slutdatum',
    selectionLabel: 'Vald period',
    openAnnounceStart: 'Kalender öppnad. Välj startdatum med piltangenterna.',
    openAnnounceEnd: (d: string) => `Kalender öppnad. Startdatum är ${d}. Välj slutdatum.`,
    announceStart: (d: string) => `Startdatum valt: ${d}. Välj slutdatum.`,
    announceNewStart: (d: string) => `Nytt startdatum: ${d}. Föregående val rensat. Välj slutdatum.`,
    announceEnd: (d: string) => `Slutdatum valt: ${d}.`,
    confirmButton: 'Bekräfta val',
    closeButton: 'Stäng utan bekräftelse',
    clearButton: 'Rensa val',
    prevMonth: 'Föregående månad',
    nextMonth: 'Nästa månad',
    separator: '–',
    requiredText: 'obligatoriskt fält',
    presetRangesLabel: 'Snabbval',
    formatHint: 'Ange datum i formatet dd.mm.åååå',
  },
  en: {
    startLabel: 'Start date',
    endLabel: 'End date',
    startPlaceholder: 'dd.mm.yyyy',
    endPlaceholder: 'dd.mm.yyyy',
    openButton: 'Open calendar',
    closeCalendarButton: 'Close calendar',
    dialogLabel: 'Date range picker',
    phaseStart: 'Select start date',
    phaseEnd: 'Select end date',
    selectionLabel: 'Selected period',
    openAnnounceStart: 'Calendar opened. Select start date using arrow keys.',
    openAnnounceEnd: (d: string) => `Calendar opened. Start date is ${d}. Select end date.`,
    announceStart: (d: string) => `Start date selected: ${d}. Now select end date.`,
    announceNewStart: (d: string) => `New start date: ${d}. Previous selection cleared. Select end date.`,
    announceEnd: (d: string) => `End date selected: ${d}.`,
    confirmButton: 'Confirm selection',
    closeButton: 'Close without confirming',
    clearButton: 'Clear selection',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    separator: '–',
    requiredText: 'required',
    presetRangesLabel: 'Quick select',
    formatHint: 'Enter dates in format dd.mm.yyyy',
  },
} as const;

export function DateRangePicker({
  id,
  label,
  language = 'fi',
  value,
  onChange,
  minDate,
  maxDate,
  presetRanges = [],
  required = false,
  disabled = false,
  errorText,
  helperText,
  colorScheme = 'bus',
  defaultMonth: defaultMonthProp,
}: DateRangePickerProps) {
  const strings = t[language];
  const locale = localeMap[language];

  const [isOpen, setIsOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<RdpDateRange | undefined>({
    from: value.startDate ?? undefined,
    to: value.endDate ?? undefined,
  });
  const [startInputValue, setStartInputValue] = useState(
    value.startDate ? format(value.startDate, DATE_FORMAT) : ''
  );
  const [endInputValue, setEndInputValue] = useState(
    value.endDate ? format(value.endDate, DATE_FORMAT) : ''
  );
  const [announceText, setAnnounceText] = useState('');
  const [phase, setPhase] = useState<'start' | 'end'>('start');
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    startOfMonth(defaultMonthProp ?? value.startDate ?? new Date())
  );
  const [animDir, setAnimDir] = useState<'forward' | 'back' | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );


  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  // Sentinel: asetetaan 'prev'/'next' kun käyttäjä navigoi kuukausinavigeilla.
  // useEffect tarkistaa tämän ja siirtää fokuksen uuden kuukauden ensimmäiseen päivään.
  // Preset-navigointi EI aseta tätä, joten se ei varasta fokusta.
  const navTriggerRef = useRef<'prev' | 'next' | null>(null);

  // Nuolinäppäimen suunta kun kalenteria navigoidaan näppäimistöllä kuukauden yli.
  // rdp:n controlled-mode ei palauta fokusta automaattisesti kuukaudenvaihdoksen jälkeen.
  const keyNavRef = useRef<'forward' | 'backward' | null>(null);

  // Desktop: pieni connector-pallo kuukausirajan yli menevissä valinnoissa.
  // Sijoitetaan 17px (padding 8 + border 1 + margin 8) aukkoon kuukausien väliin.
  // Pystyasema: 50% drp-months-anim -elementistä (CSS top:50% inline-tyylillä).
  // Vaakaasema: kuukausien välisen aukon keskipiste ≈ 280 + 9 − 3 = 286px.

  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const dialogId = `${id}-dialog`;
  const groupId = `${id}-group`;
  const announceId = `${id}-announce`;

  // Seuraa näytön leveyttä mobiili/desktop-vaihtelua varten
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Sync external value changes
  useEffect(() => {
    setStartInputValue(value.startDate ? format(value.startDate, DATE_FORMAT) : '');
    setEndInputValue(value.endDate ? format(value.endDate, DATE_FORMAT) : '');
    setPendingRange({
      from: value.startDate ?? undefined,
      to: value.endDate ?? undefined,
    });
  }, [value.startDate, value.endDate]);

  const announce = useCallback((text: string) => {
    setAnnounceText('');
    requestAnimationFrame(() => setAnnounceText(text));
  }, []);

  const openDialog = useCallback(() => {
    setIsOpen(true);
    setPhase(pendingRange?.from ? 'end' : 'start');
    setAnimDir(null);
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      // Fokusjärjestys: ensimmäinen pikavalinta → edellinen kuukausi -nappi → valittu alkupäivä → tänään → ensimmäinen päivä
      const firstPreset = dialog.querySelector<HTMLElement>('.drp-presets__buttons button:not([disabled])');
      const prevNavBtn = dialog.querySelector<HTMLElement>('.drp-nav-btn');
      const selectedStart = dialog.querySelector<HTMLElement>('.rdp-day_range_start');
      const todayBtn = dialog.querySelector<HTMLElement>(
        '.rdp-day_today:not(.rdp-day_disabled):not(.rdp-day_outside)'
      );
      const firstDay = dialog.querySelector<HTMLElement>(
        '.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)'
      );
      const target = firstPreset ?? prevNavBtn ?? selectedStart ?? todayBtn ?? firstDay;
      if (target) {
        // Synteettinen keydown asettaa selaimen "näppäimistönavigointi"-tilaan,
        // jolloin :focus-visible triggeröityy ja fokusrengas näkyy heti.
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        target.focus();
      }
    });
    announce(
      pendingRange?.from
        ? strings.openAnnounceEnd(format(pendingRange.from, DATE_FORMAT, { locale }))
        : strings.openAnnounceStart
    );
  }, [pendingRange?.from, strings, locale, announce]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setPhase('start');
    setPendingRange({ from: value.startDate ?? undefined, to: value.endDate ?? undefined });
    setStartInputValue(value.startDate ? format(value.startDate, DATE_FORMAT) : '');
    setEndInputValue(value.endDate ? format(value.endDate, DATE_FORMAT) : '');
    calendarButtonRef.current?.focus();
  }, [value.startDate, value.endDate]);

  const handleConfirm = useCallback(() => {
    onChange({ startDate: pendingRange!.from!, endDate: pendingRange!.to! });
    setStartInputValue(format(pendingRange!.from!, DATE_FORMAT));
    setEndInputValue(format(pendingRange!.to!, DATE_FORMAT));
    setPhase('start');
    setIsOpen(false);
    calendarButtonRef.current?.focus();
  }, [pendingRange, onChange]);

  const handleClear = useCallback(() => {
    onChange({ startDate: null, endDate: null });
    setPendingRange(undefined);
    setStartInputValue('');
    setEndInputValue('');
    setPhase('start');
  }, [onChange]);

  // aria-current="date" tänään-päivälle — rdp ei lisää tätä automaattisesti
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const todayBtns = dialogRef.current.querySelectorAll<HTMLButtonElement>('.rdp-day_today');
    todayBtns.forEach((btn) => btn.setAttribute('aria-current', 'date'));
    return () => {
      todayBtns.forEach((btn) => btn.removeAttribute('aria-current'));
    };
  }, [isOpen, currentMonth]);

  // Seuraa nuolinäppäinten suuntaa dialogissa — tunnistaa onko kuukaudenvaihdos
  // aiheutunut nuolinäppäimestä (vs. nav-painike tai preset).
  // Ei-nuolinäppäimet ja hiiriklikkaukset nollaavat refin.
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') keyNavRef.current = 'forward';
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') keyNavRef.current = 'backward';
      else keyNavRef.current = null;
    };
    const clearKeyNav = () => { keyNavRef.current = null; };
    dialog.addEventListener('keydown', handleKeydown);
    dialog.addEventListener('mousedown', clearKeyNav);
    return () => {
      dialog.removeEventListener('keydown', handleKeydown);
      dialog.removeEventListener('mousedown', clearKeyNav);
    };
  }, [isOpen]);

  // Fokus uuteen kuukauteen kuukausinavigoinnin jälkeen.
  // navTriggerRef: nav-painike → tänään tai ensimmäinen päivä.
  // keyNavRef: nuolinäppäin → eteenpäin=ensimmäinen, taaksepäin=viimeinen näkyvä päivä.
  // Preset-valinnat eivät aseta kumpaa tahansa — fokus pysyy preset-napissa.
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const navTrigger = navTriggerRef.current;
    const keyTrigger = keyNavRef.current;
    if (!navTrigger && !keyTrigger) return;
    navTriggerRef.current = null;
    keyNavRef.current = null;
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (navTrigger) {
        // Nav-painike: tänään tai ensimmäinen päivä
        const todayBtn = dialog.querySelector<HTMLElement>(
          '.rdp-day_today:not(.rdp-day_disabled):not(.rdp-day_outside)'
        );
        const firstDay = dialog.querySelector<HTMLElement>(
          '.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)'
        );
        const target = todayBtn ?? firstDay;
        if (target) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
          target.focus();
        }
      } else {
        // Nuolinäppäin: eteenpäin → ensimmäinen näkyvä päivä, taaksepäin → viimeinen
        const allDays = Array.from(dialog.querySelectorAll<HTMLElement>(
          '.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)'
        ));
        const target = keyTrigger === 'forward' ? allDays[0] : allDays[allDays.length - 1];
        if (target) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
          target.focus();
        }
      }
    });
  }, [isOpen, currentMonth]);

  // Body scroll lock — estää taustan scrollauksen kun mobiilidialogin on auki.
  // Desktopilla dialogi on dropdown, ei modaali — tausta saa scrollata normaalisti.
  // iOS Safari ignooraa overflow:hidden bodylla, joten käytetään position:fixed -tekniikkaa.
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, isMobile]);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDialog();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closeDialog]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeDialog]);

  // Focus trap inside dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current!.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        startInputRef.current?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleDayClick = useCallback(
    (day: Date, modifiers: { disabled?: boolean; [key: string]: boolean | undefined }) => {
      if (modifiers.disabled) return;
      if (phase === 'start') {
        const isNewCycle = !!(pendingRange?.from);
        setPendingRange({ from: day, to: undefined });
        setPhase('end');
        announce(
          isNewCycle
            ? strings.announceNewStart(format(day, DATE_FORMAT, { locale }))
            : strings.announceStart(format(day, DATE_FORMAT, { locale }))
        );
      } else {
        if (pendingRange?.from && day < pendingRange.from) {
          // Klikattu ennen alkupäivää → uusi alkupäivä, odotetaan loppupäivää
          setPendingRange({ from: day, to: undefined });
          announce(strings.announceStart(format(day, DATE_FORMAT, { locale })));
        } else {
          // Loppupäivä valittu → sykli valmis, seuraava klikkaus aloittaa alusta
          setPendingRange((prev) => ({ from: prev?.from, to: day }));
          setPhase('start');
          announce(strings.announceEnd(format(day, DATE_FORMAT, { locale })));
        }
      }
    },
    [phase, pendingRange, strings, locale, announce]
  );

  const handlePreset = useCallback(
    (preset: PresetRange) => {
      const { startDate, endDate } = preset.getRange();
      const targetMonth = startOfMonth(startDate);
      setPendingRange({ from: startDate, to: endDate });
      setPhase('start');
      // Animaatio tarvitaan vain jos kohde ei ole jo näkyvissä.
      // Mobiili: 1 kuukausi näkyvissä. Desktop: 2 kuukautta (currentMonth + currentMonth+1).
      // Normalisoidaan startOfMonth koska currentMonth voi olla kuun keskipäivältä.
      const visibleFirst = startOfMonth(currentMonth);
      const visibleSecond = startOfMonth(addMonths(currentMonth, 1));
      const alreadyVisible = isMobile
        ? targetMonth.getTime() === visibleFirst.getTime()
        : targetMonth.getTime() === visibleFirst.getTime() ||
          targetMonth.getTime() === visibleSecond.getTime();
      if (!alreadyVisible) {
        setAnimDir(targetMonth >= currentMonth ? 'forward' : 'back');
        setAnimKey((k) => k + 1);
        setCurrentMonth(targetMonth);
      }
      announce(
        `${preset.label}: ${format(startDate, DATE_FORMAT, { locale })} ${strings.separator} ${format(endDate, DATE_FORMAT, { locale })}`
      );
    },
    [currentMonth, isMobile, locale, strings.separator, announce]
  );

  const handleStartBlur = () => {
    const parsed = parse(startInputValue, DATE_FORMAT, new Date());
    if (isValid(parsed)) {
      setPendingRange((prev) => ({ from: parsed, to: prev?.to }));
    }
  };

  const handleEndBlur = () => {
    const parsedEnd = parse(endInputValue, DATE_FORMAT, new Date());
    if (isValid(parsedEnd)) {
      setPendingRange((prev) => ({ from: prev?.from, to: parsedEnd }));
      // Vahvista valinta kun kalenteri ei ole auki — kattaa mobiilin "Valmis"-napin (blur)
      if (!isOpen) {
        const parsedStart = parse(startInputValue, DATE_FORMAT, new Date());
        if (isValid(parsedStart)) {
          onChange({ startDate: parsedStart, endDate: parsedEnd });
        }
      }
    }
  };

  const goToPrevMonth = useCallback(() => {
    navTriggerRef.current = 'prev';
    setAnimDir('back');
    setAnimKey((k) => k + 1);
    setCurrentMonth((m) => startOfMonth(subMonths(m, 1)));
  }, []);

  const goToNextMonth = useCallback(() => {
    navTriggerRef.current = 'next';
    setAnimDir('forward');
    setAnimKey((k) => k + 1);
    setCurrentMonth((m) => startOfMonth(addMonths(m, 1)));
  }, []);

  const handleMonthChange = useCallback(
    (newMonth: Date) => {
      setAnimDir(newMonth > currentMonth ? 'forward' : 'back');
      setAnimKey((k) => k + 1);
      setCurrentMonth(newMonth);
    },
    [currentMonth]
  );

  const isPresetActive = (preset: PresetRange): boolean => {
    if (!pendingRange?.from || !pendingRange?.to) return false;
    const { startDate, endDate } = preset.getRange();
    return (
      format(pendingRange.from, DATE_FORMAT) === format(startDate, DATE_FORMAT) &&
      format(pendingRange.to, DATE_FORMAT) === format(endDate, DATE_FORMAT)
    );
  };

  const canConfirm = !!(pendingRange?.from && pendingRange?.to);
  const isInvalid = !!errorText;
  const formatHintId = `${id}-format`;
  const describedBy = [formatHintId, helperText ? helperId : '', errorText ? errorId : '']
    .filter(Boolean)
    .join(' ') || undefined;

  // Custom Caption-komponentti: kuukausiotsikko <h2>-elementtinä ruudunlukijalle.
  // Visuaalisesti piilotettu (rdp-caption_label CSS), mutta SR kuulee heading-semantiikan.
  const calendarComponents = useMemo(() => ({
    Caption: ({ displayMonth }: CaptionProps) => (
      <div className="rdp-caption">
        <h2 className="rdp-caption_label">
          {(() => {
            const s = format(displayMonth, 'LLLL yyyy', { locale });
            return s.charAt(0).toUpperCase() + s.slice(1);
          })()}
        </h2>
      </div>
    ),
  }), [locale]);

  return (
    <div className={`drp-root drp-root--${colorScheme}`} ref={containerRef}>
      {/* Screen reader live region */}
      <div
        id={announceId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="drp-announce"
      >
        {announceText}
      </div>

      {/* Field label */}
      <span id={`${id}-label`} className={`drp-label${required ? ' drp-label--required' : ''}`}>
        {label}
        {required && (
          <span className="drp-label__required" aria-label={`, ${strings.requiredText}`}>
            {' '}*
          </span>
        )}
      </span>

      {/* Input wrapper — position:relative ankkuroi dialogin inputin alapuolelle */}
      <div className="drp-input-wrapper">
        {/* Input group */}
        <div
          id={groupId}
          className={[
            'drp-input-group',
            isInvalid ? 'drp-input-group--invalid' : '',
            disabled ? 'drp-input-group--disabled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="group"
          aria-labelledby={`${id}-label`}
        >
          <label htmlFor={`${id}-start`} className="drp-sr-only">{strings.startLabel}</label>
          <input
            ref={startInputRef}
            id={`${id}-start`}
            type="text"
            inputMode="text"
            className="drp-input"
            aria-describedby={describedBy}
            aria-invalid={isInvalid || undefined}
            aria-required={required || undefined}
            value={startInputValue}
            disabled={disabled}
            onChange={(e) => setStartInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleStartBlur(); endInputRef.current?.focus(); } }}
            onBlur={handleStartBlur}
          />
          <span className="drp-separator" aria-hidden="true">
            {strings.separator}
          </span>
          <label htmlFor={`${id}-end`} className="drp-sr-only">{strings.endLabel}</label>
          <input
            ref={endInputRef}
            id={`${id}-end`}
            type="text"
            inputMode="text"
            className="drp-input"
            aria-describedby={describedBy}
            aria-invalid={isInvalid || undefined}
            aria-required={required || undefined}
            value={endInputValue}
            disabled={disabled}
            onChange={(e) => setEndInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const startParsed = parse(startInputValue, DATE_FORMAT, new Date());
                const endParsed = parse(endInputValue, DATE_FORMAT, new Date());
                if (isValid(startParsed) && isValid(endParsed)) {
                  // Molemmat kenttät valideja → vahvistetaan valinta ilman kalenterin avaamista
                  onChange({ startDate: startParsed, endDate: endParsed });
                } else {
                  handleEndBlur();
                }
                (e.target as HTMLInputElement).blur();
              }
            }}
            onBlur={handleEndBlur}
          />
          {/* ✅ HDS Core: clear button */}
          {value.startDate && !disabled && (
            <button
              type="button"
              className="drp-clear-btn"
              aria-label={strings.clearButton}
              onClick={handleClear}
            >
              <IconCrossCircle aria-hidden="true" />
            </button>
          )}
          <button
            ref={calendarButtonRef}
            type="button"
            className="drp-calendar-btn"
            aria-label={isOpen ? strings.closeCalendarButton : strings.openButton}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={dialogId}
            disabled={disabled}
            onClick={() => (isOpen ? closeDialog() : openDialog())}
          >
            <IconCalendar aria-hidden="true" />
          </button>
        </div>

        {/* Calendar dialog */}
        {isOpen && (
        <div
          ref={dialogRef}
          id={dialogId}
          role="dialog"
          aria-label={strings.dialogLabel}
          aria-modal="true"
          className={`drp-dialog drp-dialog--${colorScheme}`}
        >
          {/* Calendar — react-day-picker */}
          {/* ⚠️ Custom: DayPicker (react-day-picker) — EI suoraan Drupalissa */}
          {/* Drupal: Flatpickr range mode + HDS CSS */}
          <div className={`drp-calendar${phase === 'end' ? ' drp-calendar--phase-end' : ''}`}>
            {/* Pikavalinnat kalenterin yläpuolella — mobiili ja desktop */}
            {presetRanges.length > 0 && (
              <div className="drp-presets drp-presets--top" role="group" aria-labelledby={`${id}-presets-label`}>
                <h2 id={`${id}-presets-label`} className="drp-presets__label">
                  {strings.presetRangesLabel}
                </h2>
                <div className="drp-presets__buttons">
                  {presetRanges.map((preset, i) => (
                    <Button
                      key={i}
                      variant={ButtonVariant.Secondary}
                      size={ButtonSize.Small}
                      onClick={() => handlePreset(preset)}
                      aria-pressed={isPresetActive(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Nav-rivi: [←] [Maaliskuu–Huhtikuu 2026] [→] */}
            <div className="drp-calendar-nav-row">
              <button
                type="button"
                className="drp-nav-btn"
                onClick={goToPrevMonth}
                aria-label={strings.prevMonth}
              >
                <IconAngleLeft aria-hidden />
              </button>
              {/* Kombinoitu otsikko — visuaalinen, yksilölliset caption-labelit jäävät ruudunlukijoille */}
              <div className="drp-calendar-header" aria-hidden="true">
                {isMobile
                  ? (() => { const s = format(currentMonth, 'LLLL yyyy', { locale }); return s.charAt(0).toUpperCase() + s.slice(1); })()
                  : getCombinedMonthLabel(currentMonth, addMonths(currentMonth, 1), locale)}
              </div>
              <button
                type="button"
                className="drp-nav-btn"
                onClick={goToNextMonth}
                aria-label={strings.nextMonth}
              >
                <IconAngleRight aria-hidden />
              </button>
            </div>

            {/* Animoitu kuukausiwrapper — key pakottaa animaation uudelleenkäynnistyksen */}
            <div
              className={`drp-months-anim${animDir ? ` drp-months-anim--${animDir}` : ''}`}
              key={animKey}
            >
              <DayPicker
                mode="range"
                numberOfMonths={isMobile ? 1 : 2}
                selected={pendingRange}
                onDayClick={handleDayClick}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                locale={locale}
                fromDate={minDate}
                toDate={maxDate}
                weekStartsOn={1}
                showOutsideDays={false}
                components={calendarComponents}
              />
            </div>
          </div>

          {/* Footer: valintasummary + actions */}
          <div className="drp-footer">
            {/* Valittu ajankohta — Vahvista-napin yläpuolella, vasen reuna */}
            <div className="drp-phase-label" aria-hidden="true">
              {getPhaseLabel(pendingRange, strings.selectionLabel, strings.phaseStart)}
            </div>
            <div className="drp-actions">
              {/* Wrapper-divit ovat flex-lapset — order ohjaa visuaalista järjestystä.
                  Tab-järjestys seuraa DOM-järjestystä: confirm (0) ensin, close (1) toisena.
                  Vahvista ennen Suljea aina kun canConfirm=true. */}
              <div className="drp-action-confirm">
                {/* ✅ HDS Core: Button primary + IconCheck */}
                <Button
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Medium}
                  iconStart={<IconCheck aria-hidden />}
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                >
                  {strings.confirmButton}
                </Button>
              </div>
              <div className="drp-action-close">
                {/* ✅ HDS Core: Button secondary + IconCross */}
                <Button
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Medium}
                  iconStart={<IconCross aria-hidden />}
                  onClick={closeDialog}
                >
                  {strings.closeButton}
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Error text — inputin ja helper-tekstin välissä */}
      {errorText && (
        <p id={errorId} className="drp-error-text" role="alert">
          <IconErrorFill aria-hidden="true" className="drp-error-icon" />
          {errorText}
        </p>
      )}

      {/* Format hint — aina näkyvissä */}
      <p id={formatHintId} className="drp-helper-text">
        {strings.formatHint}
      </p>

      {/* Helper text */}
      {helperText && (
        <p id={helperId} className="drp-helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
}
