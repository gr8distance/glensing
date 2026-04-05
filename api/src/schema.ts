import { z } from "zod";

export const PackageSummarySchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
  license: z.string().nullable(),
});

export const PackageDetailSchema = PackageSummarySchema.extend({
  repository: z.string().nullable(),
  deps: z.array(z.string()),
  reverse_deps: z.array(z.string()),
});

export const PackageListResponseSchema = z.object({
  packages: z.array(PackageSummarySchema),
  total: z.number(),
  page: z.number(),
});

export type PackageSummary = z.infer<typeof PackageSummarySchema>;
export type PackageDetail = z.infer<typeof PackageDetailSchema>;
