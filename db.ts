import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertEventRegistration,
  InsertMemberInterest,
  InsertMemberProfile,
  InsertNewsletterSubscriber,
  InsertNotification,
  InsertUser,
  eventRegistrations,
  memberInterests,
  memberProfiles,
  newsletterSubscribers,
  notifications,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) {
    throw new Error("Database is not available");
  }
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// --- Member Profile Queries ---

export async function getMemberProfile(userId: number) {
  const db = requireDb(await getDb());
  const profile = await db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1);
  const interests = await db.select().from(memberInterests).where(eq(memberInterests.userId, userId));
  return {
    profile: profile[0] ?? null,
    interests: interests.map((i) => i.interestKey),
  };
}

export async function upsertMemberProfile(
  userId: number,
  data: Omit<InsertMemberProfile, "userId">,
  interests: string[],
) {
  const db = requireDb(await getDb());

  await db.insert(memberProfiles).values({
    ...data,
    userId,
  }).onDuplicateKeyUpdate({
    set: {
      fullName: data.fullName,
      region: data.region,
      phone: data.phone,
      categoryType: data.categoryType,
      careerRole: data.careerRole,
      company: data.company,
      pronouns: data.pronouns,
      race: data.race,
      sexualOrientation: data.sexualOrientation,
      isPublicDirectory: data.isPublicDirectory,
      bio: data.bio,
    },
  });

  // Replace interests
  await db.delete(memberInterests).where(eq(memberInterests.userId, userId));
  if (interests.length > 0) {
    await db.insert(memberInterests).values(
      interests.map((key) => ({
        userId,
        interestKey: key,
      })),
    );
  }

  return getMemberProfile(userId);
}

export async function searchMemberDirectory(filters: {
  region?: string;
  categoryType?: string;
  interestKey?: string;
  search?: string;
}) {
  const db = requireDb(await getDb());
  
  let query = db.select({
    id: memberProfiles.id,
    userId: memberProfiles.userId,
    fullName: memberProfiles.fullName,
    region: memberProfiles.region,
    categoryType: memberProfiles.categoryType,
    careerRole: memberProfiles.careerRole,
    company: memberProfiles.company,
    pronouns: memberProfiles.pronouns,
    bio: memberProfiles.bio,
  }).from(memberProfiles).where(eq(memberProfiles.isPublicDirectory, true));

  const conditions = [eq(memberProfiles.isPublicDirectory, true)];

  if (filters.region && filters.region !== "all") {
    conditions.push(like(memberProfiles.region, `%${filters.region}%`));
  }
  if (filters.categoryType && filters.categoryType !== "all") {
    conditions.push(eq(memberProfiles.categoryType, filters.categoryType));
  }
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(memberProfiles.fullName, searchTerm),
        like(memberProfiles.careerRole, searchTerm),
        like(memberProfiles.company, searchTerm),
        like(memberProfiles.region, searchTerm),
      )!
    );
  }

  const profiles = await db
    .select()
    .from(memberProfiles)
    .where(and(...conditions))
    .orderBy(desc(memberProfiles.createdAt));

  // If interest filter is passed, match userIds
  let filteredProfiles = profiles;
  if (filters.interestKey && filters.interestKey !== "all") {
    const matchedUsers = await db
      .select({ userId: memberInterests.userId })
      .from(memberInterests)
      .where(eq(memberInterests.interestKey, filters.interestKey));
    const allowedUserIds = new Set(matchedUsers.map((m) => m.userId));
    filteredProfiles = profiles.filter((p) => allowedUserIds.has(p.userId));
  }

  return filteredProfiles;
}

// --- Newsletter Subscriptions ---

export async function subscribeNewsletter(email: string, userId?: number) {
  const db = requireDb(await getDb());
  await db.insert(newsletterSubscribers).values({
    email: email.trim().toLowerCase(),
    userId: userId ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      userId: userId ?? sql`userId`,
    },
  });
  return { success: true };
}

// --- Event Registrations ---

export async function registerForEvent(userId: number, eventTitle: string, eventDate: string, location?: string) {
  const db = requireDb(await getDb());
  await db.insert(eventRegistrations).values({
    userId,
    eventTitle,
    eventDate,
    location: location ?? null,
  });
  return { success: true };
}

export async function listUserEvents(userId: number) {
  const db = requireDb(await getDb());
  return db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.userId, userId))
    .orderBy(desc(eventRegistrations.registeredAt));
}

// --- Notifications ---

export async function listNotificationsForUser(userId: number) {
  const db = requireDb(await getDb());
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function countUnreadNotificationsForUser(userId: number) {
  const db = requireDb(await getDb());
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return Number(result[0]?.count ?? 0);
}

export async function createNotification(notification: InsertNotification) {
  const db = requireDb(await getDb());
  const result = await db.insert(notifications).values(notification);
  const notificationId = Number(result[0].insertId);
  const created = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, notificationId))
    .limit(1);
  return created[0];
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const db = requireDb(await getDb());
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = requireDb(await getDb());
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

export async function listUsersForNotificationTargeting() {
  const db = requireDb(await getDb());
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      openId: users.openId,
    })
    .from(users)
    .orderBy(users.name);
}