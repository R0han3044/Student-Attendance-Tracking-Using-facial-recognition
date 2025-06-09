import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'teacher', 'student', 'parent'
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  grade: text("grade").notNull(),
  section: text("section").notNull(),
  parentId: integer("parent_id").references(() => users.id),
  profileImage: text("profile_image"),
  faceEncodings: text("face_encodings"), // JSON string of face encodings
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  grade: text("grade").notNull(),
  section: text("section").notNull(),
  schedule: text("schedule"), // JSON string for class schedule
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'late'
  timeIn: timestamp("time_in"),
  recognitionConfidence: decimal("recognition_confidence"),
  notes: text("notes"),
  markedBy: integer("marked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'attendance', 'late', 'absent'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  studentId: integer("student_id").references(() => students.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  studentProfile: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  children: many(students, {
    relationName: "parentChildren"
  }),
  teacherClasses: many(classes),
  notifications: many(notifications),
  markedAttendance: many(attendanceRecords, {
    relationName: "markedBy"
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  parent: one(users, {
    fields: [students.parentId],
    references: [users.id],
    relationName: "parentChildren"
  }),
  attendanceRecords: many(attendanceRecords),
  notifications: many(notifications),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  attendanceRecords: many(attendanceRecords),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  student: one(students, {
    fields: [attendanceRecords.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendanceRecords.classId],
    references: [classes.id],
  }),
  markedByUser: one(users, {
    fields: [attendanceRecords.markedBy],
    references: [users.id],
    relationName: "markedBy"
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  student: one(students, {
    fields: [notifications.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
