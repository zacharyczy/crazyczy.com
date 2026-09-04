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
