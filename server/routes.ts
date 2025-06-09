import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStudentSchema, insertAttendanceRecordSchema } from "@shared/schema";
import { spawn } from "child_process";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    role?: string;
  }
}

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user session
      (req.session as any).userId = user.id;
      (req.session as any).role = user.role;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Student routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", upload.single('photo'), async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      
      const student = await storage.createStudent(studentData);
      
      // If photo was uploaded, process it for facial recognition
      if (req.file) {
        try {
          const pythonProcess = spawn('python3', [
            path.join(__dirname, 'facial-recognition.py'),
            'register',
            req.file.path,
            student.id.toString()
          ]);

          pythonProcess.stdout.on('data', async (data) => {
            try {
              const result = JSON.parse(data.toString());
              if (result.success && result.encodings) {
                await storage.updateStudentFaceEncodings(student.id, JSON.stringify(result.encodings));
              }
            } catch (err) {
              console.error('Failed to parse Python output:', err);
            }
          });

          pythonProcess.stderr.on('data', (data) => {
            console.error('Python script error:', data.toString());
          });

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
        } catch (error) {
          console.error('Facial recognition processing failed:', error);
        }
      }

      res.json(student);
    } catch (error) {
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  // Facial recognition attendance
  app.post("/api/attendance/facial-recognition", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const { classId } = req.body;
      if (!classId) {
        return res.status(400).json({ message: "Class ID is required" });
      }

      // Process image with facial recognition
      const pythonProcess = spawn('python3', [
        path.join(__dirname, 'facial-recognition.py'),
        'recognize',
        req.file.path
      ]);

      let pythonOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('Python script error:', data.toString());
      });

      pythonProcess.on('close', async (code) => {
        try {
          // Clean up uploaded file
          fs.unlinkSync(req.file!.path);

          if (code !== 0) {
            return res.status(500).json({ message: "Facial recognition failed" });
          }

          const result = JSON.parse(pythonOutput);
          
          if (!result.success) {
            return res.status(400).json({ message: result.error || "Recognition failed" });
          }

          // Mark attendance for recognized students
          const attendanceRecords = [];
          const now = new Date();

          for (const recognition of result.recognitions) {
            const student = await storage.getStudent(recognition.studentId);
            if (student) {
              const attendanceRecord = {
                studentId: student.id,
                classId: parseInt(classId),
                date: now,
                status: 'present' as const,
                timeIn: now,
                recognitionConfidence: recognition.confidence,
                markedBy: (req.session as any)?.userId || null,
              };

              attendanceRecords.push(attendanceRecord);
            }
          }

          if (attendanceRecords.length > 0) {
            const createdRecords = await storage.markMultipleAttendance(attendanceRecords);
            
            // Create notifications for parents
            for (const record of createdRecords) {
              const student = await storage.getStudent(record.studentId);
              if (student?.parentId) {
                await storage.createNotification({
                  userId: student.parentId,
                  type: 'attendance',
                  title: `${student.firstName} marked present`,
                  message: `${student.firstName} ${student.lastName} was automatically marked present using facial recognition`,
                  studentId: student.id,
                });
              }
            }
          }

          res.json({
            success: true,
            recognizedStudents: result.recognitions.length,
            attendanceMarked: attendanceRecords.length,
            recognitions: result.recognitions
          });

        } catch (error) {
          console.error('Failed to process recognition results:', error);
          res.status(500).json({ message: "Failed to process recognition results" });
        }
      });

    } catch (error) {
      console.error('Facial recognition error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/class/:classId/date/:date", async (req, res) => {
    try {
      const { classId, date } = req.params;
      const attendanceDate = new Date(date);
      
      const records = await storage.getAttendanceByClassAndDate(parseInt(classId), attendanceDate);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.get("/api/attendance/student/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const stats = await storage.getStudentAttendanceStats(parseInt(studentId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/teacher/:teacherId", async (req, res) => {
    try {
      const { teacherId } = req.params;
      const stats = await storage.getTeacherStats(parseInt(teacherId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher stats" });
    }
  });

  app.get("/api/dashboard/student/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const stats = await storage.getStudentStats(parseInt(studentId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  });

  app.get("/api/dashboard/parent/:parentId", async (req, res) => {
    try {
      const { parentId } = req.params;
      const stats = await storage.getParentStats(parseInt(parentId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parent stats" });
    }
  });

  // Notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getNotificationsByUserId(parseInt(userId));
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id));
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Initialize sample data including the 5 students from the image
  app.post("/api/init-sample-data", async (req, res) => {
    try {
      // Create sample teacher
      const teacher = await storage.createUser({
        username: "prof.johnson",
        password: "password123",
        role: "teacher",
        firstName: "John",
        lastName: "Johnson",
        email: "prof.johnson@school.edu"
      });

      // Create sample parent
      const parent = await storage.createUser({
        username: "parent1",
        password: "password123",
        role: "parent",
        firstName: "Mary",
        lastName: "Chen",
        email: "mary.chen@email.com"
      });

      // Create sample class
      const mathClass = await storage.createClass({
        name: "Mathematics",
        subject: "Mathematics",
        teacherId: teacher.id,
        grade: "10",
        section: "A",
        schedule: JSON.stringify({ time: "09:00", days: ["Monday", "Wednesday", "Friday"] })
      });

      // Create the 5 students from the uploaded image
      const sampleStudents = [
        {
          studentId: "STU001",
          firstName: "Alex",
          lastName: "Johnson",
          grade: "10",
          section: "A",
          parentId: parent.id,
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
          isActive: true
        },
        {
          studentId: "STU002",
          firstName: "Sarah",
          lastName: "Chen",
          grade: "10",
          section: "A",
          parentId: parent.id,
          profileImage: "https://pixabay.com/get/g247a71a9ae678e2a2ca77efd4385cfc0ec7336459f88cbf286ea1feb1984f732832bd152613a7c40114cf2f7ca4d2e6b8b747595b2fdd8f4ad6aeee2fddfd778_1280.jpg",
          isActive: true
        },
        {
          studentId: "STU003",
          firstName: "Marcus",
          lastName: "Williams",
          grade: "10",
          section: "A",
          parentId: parent.id,
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
          isActive: true
        },
        {
          studentId: "STU004",
          firstName: "Emma",
          lastName: "Davis",
          grade: "10",
          section: "A",
          parentId: parent.id,
          profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
          isActive: true
        },
        {
          studentId: "STU005",
          firstName: "Michael",
          lastName: "Brown",
          grade: "10",
          section: "A",
          parentId: parent.id,
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
          isActive: true
        }
      ];

      const createdStudents = [];
      for (const studentData of sampleStudents) {
        const student = await storage.createStudent(studentData);
        createdStudents.push(student);
      }

      res.json({ 
        message: "Sample data initialized successfully",
        teacher,
        parent,
        mathClass,
        students: createdStudents
      });
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
      res.status(500).json({ message: "Failed to initialize sample data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
