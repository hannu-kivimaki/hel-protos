import { useState, useRef, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange as RdpDateRange } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { fi as fiFns, sv as svFns, enGB as enFns } from 'date-fns/locale';
import { Button, IconCalendar, IconCheck, IconCross, IconCrossCircle, IconAngleLeft, IconAngleRight } from 'hds-react';
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

const t = {
  fi: {
    startLabel: 'Alkupäivä',
    endLabel: 'Loppupäivä',
    startPlaceholder: 'pp.kk.vvvv',
    endPlaceholder: 'pp.kk.vvvv',
    openButton: 'Avaa kalenteri',
    dialogLabel: 'Päivämäärävälin valitsin',
    phaseStart: 'Valitse alkupäivä',
    phaseEnd: 'Valitse loppupäivä',
    announceStart: (d: string) => `Alkupäivä ${d} valittu. Valitse loppupäivä.`,
    announceEnd: (d: string) => `Loppupäivä ${d} valittu. Paina Valitse vahvistaaksesi.`,
    confirmButton: 'Valitse',
    closeButton: 'Sulje',
    clearButton: 'Tyhjennä valinta',
    separator: '–',
    requiredText: 'pakollinen kenttä',
  },
  sv: {
    startLabel: 'Startdatum',
    endLabel: 'Slutdatum',
    startPlaceholder: 'dd.mm.åååå',
    endPlaceholder: 'dd.mm.åååå',
    openButton: 'Öppna kalender',
    dialogLabel: 'Datumintervallväljare',
    phaseStart: 'Välj startdatum',
    phaseEnd: 'Välj slutdatum',
    announceStart: (d: string) => `Startdatum ${d} valt. Välj slutdatum.`,
    announceEnd: (d: string) => `Slutdatum ${d} valt. Tryck Välj för att bekräfta.`,
    confirmButton: 'Välj',
    closeButton: 'Stäng',
    clearButton: 'Rensa val',
    separator: '–',
    requiredText: 'obligatoriskt fält',
  },
  en: {
    startLabel: 'Start date',
    endLabel: 'End date',
    startPlaceholder: 'dd.mm.yyyy',
    endPlaceholder: 'dd.mm.yyyy',
    openButton: 'Open calendar',
    dialogLabel: 'Date range picker',
    phaseStart: 'Select start date',
    phaseEnd: 'Select end date',
    announceStart: (d: string) => `Start date ${d} selected. Select end date.`,
    announceEnd: (d: string) => `End date ${d} selected. Press Select to confirm.`,
    confirmButton: 'Select',
    closeButton: 'Close',
    clearButton: 'Clear selection',
    separator: '–',
    requiredText: 'required',
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

  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const dialogId = `${id}-dialog`;
  const groupId = `${id}-group`;
  const announceId = `${id}-announce`;

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
    // Move focus into dialog on next render
    requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    });
    announce(pendingRange?.from ? strings.phaseEnd : strings.phaseStart);
  }, [pendingRange?.from, strings, announce]);

  // Closing without confirming reverts pending state to last confirmed value
  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setPendingRange({ from: value.startDate ?? undefined, to: value.endDate ?? undefined });
    setStartInputValue(value.startDate ? format(value.startDate, DATE_FORMAT) : '');
    setEndInputValue(value.endDate ? format(value.endDate, DATE_FORMAT) : '');
    calendarButtonRef.current?.focus();
  }, [value.startDate, value.endDate]);

  const handleConfirm = useCallback(() => {
    onChange({ startDate: pendingRange!.from!, endDate: pendingRange!.to! });
    setIsOpen(false);
    calendarButtonRef.current?.focus();
  }, [pendingRange, onChange]);

  // Clear button — resets confirmed value and all display state
  const handleClear = useCallback(() => {
    onChange({ startDate: null, endDate: null });
    setPendingRange(undefined);
    setStartInputValue('');
    setEndInputValue('');
  }, [onChange]);

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
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleDaySelect = useCallback(
    (range: RdpDateRange | undefined) => {
      if (!range) {
        setPendingRange(undefined);
        setStartInputValue('');
        setEndInputValue('');
        announce(strings.phaseStart);
        return;
      }
      if (range.from && !range.to) {
        setPendingRange(range);
        setStartInputValue(format(range.from, DATE_FORMAT));
        setEndInputValue('');
        announce(strings.announceStart(format(range.from, DATE_FORMAT, { locale })));
      } else if (range.from && range.to) {
        setPendingRange(range);
        setStartInputValue(format(range.from, DATE_FORMAT));
        setEndInputValue(format(range.to, DATE_FORMAT));
        announce(strings.announceEnd(format(range.to, DATE_FORMAT, { locale })));
      }
    },
    [strings, locale, announce]
  );

  const handlePreset = useCallback(
    (preset: PresetRange) => {
      const { startDate, endDate } = preset.getRange();
      setPendingRange({ from: startDate, to: endDate });
      setStartInputValue(format(startDate, DATE_FORMAT));
      setEndInputValue(format(endDate, DATE_FORMAT));
      announce(
        `${preset.label}: ${format(startDate, DATE_FORMAT, { locale })} ${strings.separator} ${format(endDate, DATE_FORMAT, { locale })}`
      );
    },
    [locale, strings.separator, announce]
  );

  const handleStartBlur = () => {
    const parsed = parse(startInputValue, DATE_FORMAT, new Date());
    if (isValid(parsed)) {
      setPendingRange((prev) => ({ from: parsed, to: prev?.to }));
    }
  };

  const handleEndBlur = () => {
    const parsed = parse(endInputValue, DATE_FORMAT, new Date());
    if (isValid(parsed)) {
      setPendingRange((prev) => ({ from: prev?.from, to: parsed }));
    }
  };

  const defaultMonth = defaultMonthProp
    ?? (pendingRange?.from
      ? new Date(pendingRange.from.getFullYear(), pendingRange.from.getMonth(), 1)
      : new Date());

  const canConfirm = !!(pendingRange?.from && pendingRange?.to);
  const isInvalid = !!errorText;
  const describedBy = [helperText ? helperId : '', errorText ? errorId : '']
    .filter(Boolean)
    .join(' ') || undefined;

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
        <input
          ref={startInputRef}
          id={`${id}-start`}
          type="text"
          inputMode="numeric"
          className="drp-input"
          aria-label={strings.startLabel}
          aria-describedby={describedBy}
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          placeholder={strings.startPlaceholder}
          value={startInputValue}
          disabled={disabled}
          onChange={(e) => setStartInputValue(e.target.value)}
          onBlur={handleStartBlur}
        />
        <span className="drp-separator" aria-hidden="true">
          {strings.separator}
        </span>
        <input
          ref={endInputRef}
          id={`${id}-end`}
          type="text"
          inputMode="numeric"
          className="drp-input"
          aria-label={strings.endLabel}
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          placeholder={strings.endPlaceholder}
          value={endInputValue}
          disabled={disabled}
          onChange={(e) => setEndInputValue(e.target.value)}
          onBlur={handleEndBlur}
        />
        {/* ✅ HDS Core: clear button — visible when a range is confirmed, matches HDS DateInput clear pattern */}
        {value.startDate && !disabled && (
          <button
            type="button"
            className="drp-clear-btn"
            aria-label={strings.clearButton}
            onClick={handleClear}
          >
            {/* ✅ HDS Core: IconCrossCircle — sama kuin HDS SearchInput clear-painike */}
            <IconCrossCircle aria-hidden="true" />
          </button>
        )}
        <button
          ref={calendarButtonRef}
          type="button"
          className="drp-calendar-btn"
          aria-label={strings.openButton}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={dialogId}
          disabled={disabled}
          onClick={() => (isOpen ? closeDialog() : openDialog())}
        >
          {/* ✅ HDS Core: IconCalendar */}
          <IconCalendar aria-hidden="true" />
        </button>
      </div>

      {/* Helper text */}
      {helperText && (
        <p id={helperId} className="drp-helper-text">
          {helperText}
        </p>
      )}

      {/* Error text */}
      {errorText && (
        <p id={errorId} className="drp-error-text" role="alert">
          {errorText}
        </p>
      )}

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
          <div className="drp-calendar">
            <DayPicker
              mode="range"
              numberOfMonths={2}
              selected={pendingRange}
              onSelect={handleDaySelect}
              defaultMonth={defaultMonth}
              locale={locale}
              fromDate={minDate}
              toDate={maxDate}
              weekStartsOn={1}
              showOutsideDays={false}
              components={{
                IconLeft: () => <IconAngleLeft aria-hidden />,
                IconRight: () => <IconAngleRight aria-hidden />,
              }}
            />
          </div>

          {/* Footer: presets + actions */}
          <div className="drp-footer">
            {presetRanges.length > 0 && (
              <div className="drp-presets" role="group" aria-label="Pikavalinnat">
                {/* ✅ HDS Core: Button supplementary — iconLeft=null workaround (HDS vaatii ikonin supplementary-variantille) */}
                {presetRanges.map((preset, i) => (
                  <Button
                    key={i}
                    variant="supplementary"
                    size="small"
                    onClick={() => handlePreset(preset)}
                    iconLeft={null as unknown as React.ReactNode}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="drp-actions">
              {/* ✅ HDS Core: Button supplementary + IconCross — sama kuin HDS DateInput "Sulje" */}
              <Button
                variant="supplementary"
                size="small"
                iconLeft={<IconCross aria-hidden />}
                onClick={closeDialog}
              >
                {strings.closeButton}
              </Button>
              {/* ✅ HDS Core: Button secondary + IconCheck — sama kuin HDS DateInput "Valitse" */}
              <Button
                variant="secondary"
                size="small"
                iconLeft={<IconCheck aria-hidden />}
                onClick={handleConfirm}
                disabled={!canConfirm}
              >
                {strings.confirmButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
