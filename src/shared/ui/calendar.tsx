import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  appointmentCounts,
  compact = false,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  appointmentCounts?: Map<string, number>;
  compact?: boolean;
}) {
  const defaultClassNames = getDefaultClassNames();
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar",
        compact ? "p-1" : "p-3",
        "[--cell-size:1.75rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex flex-col md:flex-row relative",
          compact ? "gap-2" : "gap-4",
          defaultClassNames.months,
        ),
        month: cn(
          "flex flex-col w-full",
          compact ? "gap-0.5" : "gap-1",
          defaultClassNames.month,
        ),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav,
        ),
        // ✅ CAMBIO: gap-0 → gap-1.5 para separar los días
        week: cn(
          "flex w-full",
          compact ? "gap-1" : "gap-1.5",
          defaultClassNames.week,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          compact
            ? "size-8 aria-disabled:opacity-50 p-1 select-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full"
            : "size-11 aria-disabled:opacity-50 p-2 select-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          compact
            ? "size-8 aria-disabled:opacity-50 p-1 select-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full"
            : "size-11 aria-disabled:opacity-50 p-2 select-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          compact
            ? "flex items-center justify-center h-8 w-full px-4 mb-2"
            : "flex items-center justify-center h-12 w-full px-10 mb-8",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          compact
            ? "w-full flex items-center font-medium justify-center h-8 gap-1"
            : "w-full flex items-center font-medium justify-center h-12 gap-1.5",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative has-focus:border-accent border border-input shadow-xs has-focus:ring-accent/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          compact
            ? "select-none font-medium text-primary text-base"
            : "select-none font-medium text-primary text-2xl",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn(
          // ✅ CAMBIO: también gap-1.5 en los encabezados de día para alinear
          compact ? "flex mb-1 gap-1" : "flex mb-2 gap-1.5",
          defaultClassNames.weekdays,
        ),
        weekday: cn(
          compact
            ? "text-muted-foreground rounded-md flex-1 font-medium text-xs select-none uppercase tracking-wide"
            : "text-muted-foreground rounded-md flex-1 font-medium text-sm select-none uppercase tracking-wide",
          defaultClassNames.weekday,
        ),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "text-xs select-none text-muted-foreground",
          defaultClassNames.week_number,
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          defaultClassNames.day,
        ),
        range_start: cn(
          "rounded-full bg-accent",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-full bg-accent", defaultClassNames.range_end),
        today: cn("font-semibold text-primary", defaultClassNames.today),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground opacity-40",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn(compact ? "size-5" : "size-7", className)}
                {...props}
              />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn(compact ? "size-5" : "size-7", className)}
                {...props}
              />
            );
          }
          return (
            <ChevronDownIcon
              className={cn(compact ? "size-5" : "size-7", className)}
              {...props}
            />
          );
        },
        DayButton: (dayButtonProps) => (
          <CalendarDayButton
            {...dayButtonProps}
            appointmentCounts={appointmentCounts}
            compact={compact}
          />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  appointmentCounts,
  compact = false,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  appointmentCounts?: Map<string, number>;
  compact?: boolean;
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const appointmentCount = appointmentCounts?.get(day.date.toDateString()) || 0;

  const getIntensityColor = (count: number) => {
    if (count === 0) return "";
    if (count === 1) return "bg-accent/40 border-accent-foreground/40";
    if (count === 2) return "bg-accent/80 border-accent-foreground/80";
    if (count >= 3) return "bg-accent border-accent-foreground";
    return "";
  };

  const intensityClass = getIntensityColor(appointmentCount);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-accent group-data-[focused=true]/day:ring-accent/50 dark:hover:text-primary dark:hover:bg-primary/20 flex aspect-square w-full mx-auto flex-col items-center justify-center leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 rounded-full data-[range-end=true]:rounded-full data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-full hover:bg-primary/10 transition-colors duration-150",
        // ✅ CAMBIO: max-w reducido para dejar espacio al gap
        compact
          ? "max-w-[1.25rem] h-5 p-1 text-xs"
          : "max-w-[1.75rem] h-7 p-4.5 text-sm",
        modifiers.today && "border border-primary",
        intensityClass,
        appointmentCount > 0 && "border-2",
        defaultClassNames.day,
        className,
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {appointmentCount > 0 && (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold",
            compact
              ? "text-[9px] w-3 h-3 -top-0.5 -right-0.5"
              : "text-xs w-4 h-4 -top-1 -right-1",
          )}
        >
          {appointmentCount}
        </span>
      )}
    </Button>
  );
}

export { Calendar, CalendarDayButton };
