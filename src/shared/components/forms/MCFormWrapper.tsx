import { type ReactNode, useEffect } from "react";
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form";
import { z, type ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form as MCForm } from "@/shared/ui/form";
import { cn } from "@/lib/utils";

interface MCFormWrapperProps<TSchema extends ZodType<any, any, any>> {
  schema: TSchema;
  defaultValues?: z.input<TSchema>;
  onSubmit: (data: z.output<TSchema>) => void;
  children: ReactNode;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  submitRef?: React.MutableRefObject<(() => void) | null>;
  formRef?: React.MutableRefObject<UseFormReturn<any> | null>; // NUEVO
}

function MCFormWrapper<TSchema extends ZodType<any, any, any>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  onValidationChange,
  submitRef,
  formRef, // NUEVO
}: MCFormWrapperProps<TSchema>) {
  const methods = useForm<z.input<TSchema>, any, z.output<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(methods.formState.isValid);
    }
  }, [methods.formState.isValid, onValidationChange]);

  // Exponer la función de submit a través del ref
  useEffect(() => {
    if (submitRef) {
      submitRef.current = methods.handleSubmit(onSubmit);
    }
  }, [submitRef, methods.handleSubmit, onSubmit]);

  // NUEVO: Exponer los métodos del formulario
  useEffect(() => {
    if (formRef) {
      formRef.current = methods;
    }
  }, [formRef, methods]);

  return (
    <FormProvider {...methods}>
      <MCForm {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn("", className)}
        >
          {children}
        </form>
      </MCForm>
    </FormProvider>
  );
}

export default MCFormWrapper;
