import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Member profiles capturing professional info, regions, career roles,
 * and privacy-controlled optional demographic data.
 */
export const memberProfiles = mysqlTable(
  "member_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    fullName: varchar("fullName", { length: 160 }).notNull(),
    region: varchar("region", { length: 120 }).notNull(), // e.g., Nashville, Los Angeles, London
    phone: varchar("phone", { length: 40 }),
    categoryType: varchar("categoryType", { length: 100 }).notNull(), // artist, manager, producer, writer, lawyer, creative, etc.
    careerRole: varchar("careerRole", { length: 160 }).notNull(),
    company: varchar("company", { length: 160 }),
    pronouns: varchar("pronouns", { length: 60 }),
    race: varchar("race", { length: 100 }), // Optional, privacy-controlled
    sexualOrientation: varchar("sexualOrientation", { length: 100 }), // Optional, privacy-controlled
    isPublicDirectory: boolean("isPublicDirectory").default(true).notNull(),
    bio: text("bio"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userProfileIdx: index("member_profiles_user_idx").on(table.userId),
    regionCategoryIdx: index("member_profiles_region_category_idx").on(table.region, table.categoryType),
  }),
);

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;

/**
 * Member interests for songwriting camps, showcases, galas, mentorship, etc.
 */
export const memberInterests = mysqlTable(
  "member_interests",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    interestKey: varchar("interestKey", { length: 80 }).notNull(), // songwriting_camp, showcase, gala, networking, mentorship, job, grant, nashville_songwriters, other
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userInterestIdx: index("member_interests_user_key_idx").on(table.userId, table.interestKey),
  }),
);

export type MemberInterest = typeof memberInterests.$inferSelect;
export type InsertMemberInterest = typeof memberInterests.$inferInsert;

/**
 * Newsletter signups captured site-wide
 */
export const newsletterSubscribers = mysqlTable(
  "newsletter_subscribers",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    userId: int("userId").references(() => users.id, { onDelete: "set null" }),
    subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("newsletter_email_idx").on(table.email),
  }),
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * Event registrations (songwriting camps, annual gala, showcases, webinars)
 */
export const eventRegistrations = mysqlTable(
  "event_registrations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventTitle: varchar("eventTitle", { length: 200 }).notNull(),
    eventDate: varchar("eventDate", { length: 100 }).notNull(),
    location: varchar("location", { length: 120 }),
    status: varchar("status", { length: 40 }).default("registered").notNull(),
    registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  },
  (table) => ({
    userEventIdx: index("event_registrations_user_idx").on(table.userId),
  }),
);

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

/**
 * In-app notifications
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).notNull(),
    message: text("message").notNull(),
    type: mysqlEnum("type", ["info", "success", "alert"]).default("info").notNull(),
    href: varchar("href", { length: 500 }),
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    readAt: timestamp("readAt"),
  },
  (table) => ({
    userCreatedIdx: index("notifications_user_created_idx").on(table.userId, table.createdAt),
    userReadIdx: index("notifications_user_read_idx").on(table.userId, table.isRead),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;