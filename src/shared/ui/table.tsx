import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // Cambios: borde con color primary/15
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-primary/15 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const ref = React.useRef<HTMLTableCellElement>(null);
  const [alignment, setAlignment] = React.useState<string>("text-left");

  React.useEffect(() => {
    if (ref.current) {
      const row = ref.current.parentElement;
      if (row) {
        const cells = Array.from(row.children);
        const index = cells.indexOf(ref.current);
        const totalCells = cells.length;

        if (index === 0) {
          setAlignment("text-start");
        } else if (index === totalCells - 1) {
          setAlignment("text-end");
        } else {
          setAlignment("text-center");
        }
      }
    }
  }, []);

  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        // Quitado bg-primary/10
        "text-foreground h-12 px-2 align-middle font-bold whitespace-nowrap text-base [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        alignment,
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const ref = React.useRef<HTMLTableCellElement>(null);
  const [alignment, setAlignment] = React.useState<string>("text-left");

  React.useEffect(() => {
    if (ref.current) {
      const row = ref.current.parentElement;
      if (row) {
        const cells = Array.from(row.children);
        const index = cells.indexOf(ref.current);
        const totalCells = cells.length;

        if (index === 0) {
          setAlignment("text-start");
        } else if (index === totalCells - 1) {
          setAlignment("text-end");
        } else {
          setAlignment("text-center");
        }
      }
    }
  }, []);

  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        alignment,
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
