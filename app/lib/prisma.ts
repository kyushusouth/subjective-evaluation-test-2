// /* eslint-disable import/prefer-default-export */
// import { PrismaClient } from "@prisma/client";

// export const prisma = new PrismaClient();

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => new PrismaClient({ log: ["info"] });

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
