import type { AllocationSlice } from "@/lib/clients";
import { ALLOCATION_COLORS } from "@/lib/clients";

export function AllocationBar({
  allocation,
}: {
  allocation: AllocationSlice[];
}) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {allocation.map((slice) => (
          <div
            key={slice.label}
            className={ALLOCATION_COLORS[slice.label]}
            style={{ width: `${slice.percent}%` }}
            title={`${slice.label} ${slice.percent}%`}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {allocation.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                ALLOCATION_COLORS[slice.label]
              }`}
            />
            <span className="text-zinc-500 dark:text-zinc-400">
              {slice.label}
            </span>
            <span className="ml-auto font-medium text-zinc-900 dark:text-zinc-100">
              {slice.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
