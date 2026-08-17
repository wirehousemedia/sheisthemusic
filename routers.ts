import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  countUnreadNotificationsForUser,
  createNotification,
  getMemberProfile,
  listNotificationsForUser,
  listUserEvents,
  listUsersForNotificationTargeting,
  markAllNotificationsRead,
  markNotificationRead,
  registerForEvent,
  searchMemberDirectory,
  subscribeNewsletter,
  upsertMemberProfile,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const notificationType = z.enum(["info", "success", "alert"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  members: router({
    profile: protectedProcedure.query(({ ctx }) => getMemberProfile(ctx.user.id)),
    upsertProfile: protectedProcedure
      .input(
        z.object({
          fullName: z.string().trim().min(2).max(160),
          region: z.string().trim().min(2).max(120),
          phone: z.string().trim().max(40).optional().or(z.literal("")),
          categoryType: z.string().trim().min(2).max(100),
          careerRole: z.string().trim().min(2).max(160),
          company: z.string().trim().max(160).optional().or(z.literal("")),
          pronouns: z.string().trim().max(60).optional().or(z.literal("")),
          race: z.string().trim().max(100).optional().or(z.literal("")),
          sexualOrientation: z.string().trim().max(100).optional().or(z.literal("")),
          isPublicDirectory: z.boolean().default(true),
          bio: z.string().trim().max(2000).optional().or(z.literal("")),
          interests: z.array(z.string()).default([]),
        }),
      )
      .mutation(({ ctx, input }) => {
        const { interests, ...profileData } = input;
        return upsertMemberProfile(
          ctx.user.id,
          {
            fullName: profileData.fullName,
            region: profileData.region,
            phone: profileData.phone || null,
            categoryType: profileData.categoryType,
            careerRole: profileData.careerRole,
            company: profileData.company || null,
            pronouns: profileData.pronouns || null,
            race: profileData.race || null,
            sexualOrientation: profileData.sexualOrientation || null,
            isPublicDirectory: profileData.isPublicDirectory,
            bio: profileData.bio || null,
          },
          interests,
        );
      }),
    directory: publicProcedure
      .input(
        z.object({
          region: z.string().optional(),
          categoryType: z.string().optional(),
          interestKey: z.string().optional(),
          search: z.string().optional(),
        }),
      )
      .query(({ input }) => searchMemberDirectory(input)),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email().max(320) }))
      .mutation(({ ctx, input }) => subscribeNewsletter(input.email, ctx.user?.id)),
  }),

  events: router({
    list: protectedProcedure.query(({ ctx }) => listUserEvents(ctx.user.id)),
    register: protectedProcedure
      .input(
        z.object({
          eventTitle: z.string().trim().min(2).max(200),
          eventDate: z.string().trim().min(2).max(100),
          location: z.string().trim().max(120).optional().or(z.literal("")),
        }),
      )
      .mutation(({ ctx, input }) =>
        registerForEvent(ctx.user.id, input.eventTitle, input.eventDate, input.location || undefined),
      ),
  }),

  notifications: router({
    list: protectedProcedure.query(({ ctx }) => listNotificationsForUser(ctx.user.id)),
    unreadCount: protectedProcedure.query(({ ctx }) => countUnreadNotificationsForUser(ctx.user.id)),
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => markNotificationRead(ctx.user.id, input.notificationId)),
    markAllRead: protectedProcedure.mutation(({ ctx }) => markAllNotificationsRead(ctx.user.id)),
    adminTargets: adminProcedure.query(() => listUsersForNotificationTargeting()),
    adminCreate: adminProcedure
      .input(
        z.object({
          targetUserId: z.number().int().positive(),
          title: z.string().trim().min(1).max(160),
          message: z.string().trim().min(1).max(5000),
          type: notificationType.default("info"),
          href: z.string().trim().url().max(500).optional().or(z.literal("")),
        }),
      )
      .mutation(({ input }) =>
        createNotification({
          userId: input.targetUserId,
          title: input.title,
          message: input.message,
          type: input.type,
          href: input.href || null,
        }),
      ),
  }),
});

export type AppRouter = typeof appRouter;
