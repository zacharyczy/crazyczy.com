import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const suggestions = sqliteTable('suggestions', {
  id: text('id').primaryKey(),
  author: text('author').notNull().default('Guest'),
  body: text('body').notNull(),
  score: integer('score').notNull().default(0),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_suggestions_created_at').on(table.createdAt),
  index('idx_suggestions_score').on(table.score),
]);

export const suggestionVotes = sqliteTable('suggestion_votes', {
  id: text('id').primaryKey(),
  suggestionId: text('suggestion_id').notNull().references(() => suggestions.id, { onDelete: 'cascade' }),
  visitorId: text('visitor_id').notNull(),
  value: integer('value').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_suggestion_votes_visitor').on(table.suggestionId, table.visitorId),
]);

export const dailySuggestionUsage = sqliteTable('daily_suggestion_usage', {
  id: text('id').primaryKey(),
  visitorId: text('visitor_id').notNull(),
  dayKey: text('day_key').notNull(),
  count: integer('count').notNull().default(0),
}, (table) => [
  uniqueIndex('idx_daily_suggestion_usage_visitor_day').on(table.visitorId, table.dayKey),
]);

export const writingComments = sqliteTable('writing_comments', {
  id: text('id').primaryKey(),
  postKey: text('post_key').notNull(),
  visitorId: text('visitor_id').notNull(),
  author: text('author').notNull().default('Guest'),
  body: text('body').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_writing_comments_post_created').on(table.postKey, table.createdAt),
  index('idx_writing_comments_visitor_created').on(table.visitorId, table.createdAt),
]);

export const writingLikes = sqliteTable('writing_likes', {
  id: text('id').primaryKey(),
  postKey: text('post_key').notNull(),
  targetKind: text('target_kind').notNull(),
  targetId: text('target_id').notNull(),
  visitorId: text('visitor_id').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_writing_likes_target_visitor').on(table.targetKind, table.targetId, table.visitorId),
  index('idx_writing_likes_post').on(table.postKey),
]);
