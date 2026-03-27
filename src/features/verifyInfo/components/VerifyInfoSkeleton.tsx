import { Skeleton } from "@/shared/ui/skeleton";

function VerifyInfoSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 sm:grid sm:grid-cols-[3fr_7fr]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-[260px] w-full rounded-4xl" />
        </div>

        <main className="mt-4 sm:mt-0">
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-4xl">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="mt-4 flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-4xl">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default VerifyInfoSkeleton;
