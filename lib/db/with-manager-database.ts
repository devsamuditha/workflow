import "server-only";

import type { Prisma } from "@prisma/client";
import { isManagerEmail } from "@/lib/auth/manager-access";
import { prisma } from "@/lib/db/prisma";

export function withManagerDatabase<T>(
  userId: string,
  userEmail: string | undefined,
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
) {
  if (!isManagerEmail(userEmail)) {
    throw new Error("The configured manager account is required.");
  }

  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`SET LOCAL ROLE authenticated`;
      await transaction.$queryRaw`
        SELECT
          set_config('request.jwt.claim.sub', ${userId}, true),
          set_config(
            'request.jwt.claims',
            ${JSON.stringify({ app_metadata: { workflow_role: "manager" } })},
            true
          )
      `;

      return operation(transaction);
    },
    { maxWait: 5000, timeout: 10000 },
  );
}
