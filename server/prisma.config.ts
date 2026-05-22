import "dotenv/config";

export default {
  earlyAdopter: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
