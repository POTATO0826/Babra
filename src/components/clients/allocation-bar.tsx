import type { AllocationSlice } from "@/lib/clients";
import { allocColor } from "@/lib/format";

export function AllocationBar({
  allocation,
}: {
  allocation: AllocationSlice[];
}) {
  return (
    <div>
      <div className="mb-3.5 flex h-3.5 overflow-hidden rounded-lg">
        {allocation.map((slice) => (
          <div
            key={slice.label}
            style={{ width: `${slice.percent}%`, background: allocColor(slice.label) }}
            title={`${slice.label} ${slice.percent}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-[22px] gap-y-3.5">
        {allocation.map((slice) => (
          <span
            key={slice.label}
            className="inline-flex items-center gap-[7px] text-[12.5px] text-body"
          >
            <span
              className="h-[9px] w-[9px] rounded-[3px]"
              style={{ background: allocColor(slice.label) }}
            />
            <span className="font-semibold">{slice.label}</span>
            <span className="tabular-nums text-quiet">{slice.percent}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
