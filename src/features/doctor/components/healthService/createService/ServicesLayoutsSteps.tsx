interface servicesLayoutsStepsProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function ServicesLayoutsSteps({
  title,
  description,
  children,
}: servicesLayoutsStepsProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex flex-col items-center justify-center gap-4 ">
        <h1 className="text-5xl  text-center text-primary mt-10">{title}</h1>
        {description && (
          <div className="opacity-40 text-center">{description}</div>
        )}
      </div>
      <div className="">{children}</div>
    </div>
  );
}

export default ServicesLayoutsSteps;
