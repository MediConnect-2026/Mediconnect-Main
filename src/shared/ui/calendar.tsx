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
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  appointmentCounts?: Map<string, number>;
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-2", // Reducido de p-3 a p-2
        "[--cell-size:1.5rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent", // Reducido de 1.75rem a 1.5rem
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
          "flex gap-2 flex-col md:flex-row relative", // Reducido de gap-4 a gap-2
          defaultClassNames.months,
        ),
        month: cn(
          "flex flex-col w-full gap-0.5", // Reducido de gap-1 a gap-0.5
          defaultClassNames.month,
        ),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav,
        ),
        week: cn(
          "flex w-full gap-0", // Mantiene gap-0
          defaultClassNames.week,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-9 aria-disabled:opacity-50 p-1.5 select-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full", // Reducido de size-11 a size-9
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-9 aria-disabled:opacity-50 p-1.5 select-none transition-all duration-200 hover:bg-primary/10  dark:hover:bg-primary/20 active:scale-95 rounded-full", // Reducido de size-11 a size-9
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center h-10 w-full px-8 mb-4", // Reducido h-12 a h-10, mb-8 a mb-4, px-10 a px-8
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "w-full flex items-center font-medium justify-center h-10 gap-1.5", // Reducido de h-12 a h-10
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
          "select-none font-medium text-primary text-xl", // Reducido de text-2xl a text-xl
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn(
          "flex mb-1 gap-0.5", // Reducido de mb-2 a mb-1
          defaultClassNames.weekdays,
        ),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-medium text-xs select-none uppercase tracking-wide", // Reducido de text-sm a text-xs
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
              <ChevronLeftIcon className={cn("size-6", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-6", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-6", className)} {...props} />
          );
        },
        DayButton: (dayButtonProps) => (
          <CalendarDayButton
            {...dayButtonProps}
            appointmentCounts={appointmentCounts}
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
  ...props
}: React.ComponentProps<typeof DayButton> & {
  appointmentCounts?: Map<string, number>;
}) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // Get appointment count for this day
  const appointmentCount = appointmentCounts?.get(day.date.toDateString()) || 0;

  // Generate color intensity based on appointment count
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
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-accent group-data-[focused=true]/day:ring-accent/50 dark:hover:text-primary dark:hover:bg-primary/20 flex aspect-square w-full max-w-[1.75rem] h-7 mx-auto p-3 flex-col items-center justify-center leading-none font-normal text-xs group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 rounded-full data-[range-end=true]:rounded-full data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-full hover:bg-primary/10 transition-colors duration-150",
        modifiers.today && "border border-primary",
        intensityClass,
        appointmentCount > 0 && "border-2",
        defaultClassNames.day,
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          appointmentCount > 0 &&
            !modifiers.selected &&
            "text-primary dark:text-primary-foreground",
        )}
      >
        {day.date.getDate()}
      </span>
      {appointmentCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-semibold">
          {appointmentCount}
        </span>
      )}
    </Button>
  );
}

export { Calendar, CalendarDayButton };
