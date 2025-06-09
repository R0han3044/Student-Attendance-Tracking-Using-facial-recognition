import { 
  users, 
  students, 
  classes, 
  attendanceRecords, 
  notifications,
  type User, 
  type InsertUser,
  type Student,
  type InsertStudent,
  type Class,
  type InsertClass,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student methods
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentsByParentId(parentId: number): Promise<Student[]>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudentFaceEncodings(id: number, encodings: string): Promise<Student | undefined>;

  // Class methods
  getClass(id: number): Promise<Class | undefined>;
  getClassesByTeacherId(teacherId: number): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;

  // Attendance methods
  getAttendanceRecord(id: number): Promise<AttendanceRecord | undefined>;
  getAttendanceByStudentAndDate(studentId: number, date: Date): Promise<AttendanceRecord[]>;
  getAttendanceByClassAndDate(classId: number, date: Date): Promise<AttendanceRecord[]>;
  getStudentAttendanceStats(studentId: number): Promise<any>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  markMultipleAttendance(records: InsertAttendanceRecord[]): Promise<AttendanceRecord[]>;

  // Notification methods
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;

  // Dashboard stats
  getTeacherStats(teacherId: number): Promise<any>;
  getStudentStats(studentId: number): Promise<any>;
  getParentStats(parentId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student || undefined;
  }

  async getStudentsByParentId(parentId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.parentId, parentId));
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.isActive, true));
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudentFaceEncodings(id: number, encodings: string): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set({ faceEncodings: encodings })
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  // Class methods
  async getClass(id: number): Promise<Class | undefined> {
    const [classData] = await db.select().from(classes).where(eq(classes.id, id));
    return classData || undefined;
  }

  async getClassesByTeacherId(teacherId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.teacherId, teacherId));
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const [classData] = await db
      .insert(classes)
      .values(insertClass)
      .returning();
    return classData;
  }

  // Attendance methods
  async getAttendanceRecord(id: number): Promise<AttendanceRecord | undefined> {
    const [record] = await db.select().from(attendanceRecords).where(eq(attendanceRecords.id, id));
    return record || undefined;
  }

  async getAttendanceByStudentAndDate(studentId: number, date: Date): Promise<AttendanceRecord[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.studentId, studentId),
          sql`${attendanceRecords.date} >= ${startOfDay}`,
          sql`${attendanceRecords.date} <= ${endOfDay}`
        )
      );
  }

  async getAttendanceByClassAndDate(classId: number, date: Date): Promise<AttendanceRecord[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select({
        id: attendanceRecords.id,
        studentId: attendanceRecords.studentId,
        classId: attendanceRecords.classId,
        date: attendanceRecords.date,
        status: attendanceRecords.status,
        timeIn: attendanceRecords.timeIn,
        recognitionConfidence: attendanceRecords.recognitionConfidence,
        notes: attendanceRecords.notes,
        markedBy: attendanceRecords.markedBy,
        createdAt: attendanceRecords.createdAt,
        student: {
          id: students.id,
          studentId: students.studentId,
          firstName: students.firstName,
          lastName: students.lastName,
        }
      })
      .from(attendanceRecords)
      .leftJoin(students, eq(attendanceRecords.studentId, students.id))
      .where(
        and(
          eq(attendanceRecords.classId, classId),
          sql`${attendanceRecords.date} >= ${startOfDay}`,
          sql`${attendanceRecords.date} <= ${endOfDay}`
        )
      );
  }

  async getStudentAttendanceStats(studentId: number): Promise<any> {
    const totalDays = await db
      .select({ count: count() })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, studentId));

    const presentDays = await db
      .select({ count: count() })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.status, 'present')
        )
      );

    const lateDays = await db
      .select({ count: count() })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.status, 'late')
        )
      );

    const total = totalDays[0]?.count || 0;
    const present = presentDays[0]?.count || 0;
    const late = lateDays[0]?.count || 0;
    const absent = total - present - late;

    return {
      totalDays: total,
      presentDays: present,
      absentDays: absent,
      lateDays: late,
      attendancePercentage: total > 0 ? ((present + late) / total * 100).toFixed(1) : 0
    };
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db
      .insert(attendanceRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async markMultipleAttendance(records: InsertAttendanceRecord[]): Promise<AttendanceRecord[]> {
    return await db
      .insert(attendanceRecords)
      .values(records)
      .returning();
  }

  // Notification methods
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Dashboard stats
  async getTeacherStats(teacherId: number): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all students from teacher's classes
    const teacherClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.teacherId, teacherId));

    if (teacherClasses.length === 0) {
      return {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0
      };
    }

    const classIds = teacherClasses.map(c => c.id);

    // Get today's attendance for all classes
    const todayAttendance = classIds.length > 0 ? await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          sql`${attendanceRecords.classId} IN (${sql.join(classIds.map(id => sql`${id}`), sql`, `)})`,
          sql`${attendanceRecords.date} >= ${today}`
        )
      ) : [];

    const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const totalStudents = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.isActive, true));

    return {
      totalStudents: totalStudents[0]?.count || 0,
      presentToday,
      absentToday: (totalStudents[0]?.count || 0) - presentToday,
      attendanceRate: totalStudents[0]?.count > 0 ? 
        (presentToday / totalStudents[0].count * 100).toFixed(1) : 0
    };
  }

  async getStudentStats(studentId: number): Promise<any> {
    return await this.getStudentAttendanceStats(studentId);
  }

  async getParentStats(parentId: number): Promise<any> {
    const children = await this.getStudentsByParentId(parentId);
    const stats = await Promise.all(
      children.map(async (child) => {
        const childStats = await this.getStudentAttendanceStats(child.id);
        return {
          ...child,
          ...childStats
        };
      })
    );

    return stats;
  }
}

export const storage = new DatabaseStorage();
