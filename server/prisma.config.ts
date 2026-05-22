require("dotenv").config();

module.exports = {
  earlyAdopter: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
