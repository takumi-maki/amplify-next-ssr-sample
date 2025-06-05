"use server";

import { revalidateTag } from "next/cache";

export async function revalidateTest() {
  revalidateTag("test-revalidate");
}
