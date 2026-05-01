import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";
import { useFormContext, Controller } from "react-hook-form";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

type MCOtpInputProps = {
  id?: string;
  maxLength?: number;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

function MCOtpInput({
  id = "otp",
  maxLength = 6,
  disabled,
  onChange,
}: MCOtpInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const isMobile = useIsMobile();

  return (
    <div className="w-full flex flex-col mb-4">
      <div className="flex flex-col items-center">
        <Controller
          name={id}
          control={control}
          render={({ field }) => (
            <InputOTP
              value={field.value || ""}
              onChange={(value) => {
                field.onChange(value);
                if (onChange) onChange(value);
              }}
              maxLength={maxLength}
              disabled={disabled}
            >
              <InputOTPGroup id={id} className={isMobile ? "gap-2" : "gap-6"}>
                {Array.from({ length: maxLength }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={`
                      rounded-md
                      font-semibold
                      bg-[var(--theme-surface)]
                      border border-[var(--theme-border)]
                      text-[var(--theme-text)]
                      focus:ring-0
                      focus:border-[var(--theme-primary)]
                      data-[active=true]:border-[var(--theme-primary)]
                      data-[active=true]:ring-2
                      data-[active=true]:ring-[var(--theme-primary)]/20
                      transition-all duration-150
                      ${
                        isMobile
                          ? "h-[44px] w-[44px] text-base"
                          : "h-[60px] w-[60px] text-xl"
                      }
                    `}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />

        {errors[id] && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {errors[id]?.message as string}
          </p>
        )}
      </div>
    </div>
  );
}

export default MCOtpInput;
