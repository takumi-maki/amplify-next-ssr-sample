"use client";

import { revalidateTest } from "@/lib/action";

export default function RevalidateTest() {
  return (
    <div className="text-slate-500">
      <form action={revalidateTest}>
        <button>revalidateTest</button>
      </form>
    </div>
  );
}
