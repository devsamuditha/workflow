import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export function withUserDatabase<T>(
  userId: string,
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`SET LOCAL ROLE authenticated`;
      await transaction.$queryRaw`
        SELECT set_config('request.jwt.claim.sub', ${userId}, true)
      `;

      return operation(transaction);
    },
    { maxWait: 5000, timeout: 10000 },
  );
}
