import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  profileImage?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  timeIn?: string;
  recognitionConfidence?: number;
  notes?: string;
}

export interface FacialRecognitionResult {
  success: boolean;
  recognizedStudents: number;
  attendanceMarked: number;
  recognitions: Array<{
    studentId: number;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

// Authentication API
export const authApi = {
  login: (credentials: LoginCredentials) => 
    apiRequest("POST", "/api/auth/login", credentials),
  
  logout: () => 
    apiRequest("POST", "/api/auth/logout"),
  
  getMe: () => 
    apiRequest("GET", "/api/auth/me"),
};

// Students API
export const studentsApi = {
  getAll: () => 
    apiRequest("GET", "/api/students"),
  
  create: (formData: FormData) => 
    fetch("/api/students", {
      method: "POST",
      body: formData,
      credentials: "include",
    }),
};

// Attendance API
export const attendanceApi = {
  getByClassAndDate: (classId: number, date: string) => 
    apiRequest("GET", `/api/attendance/class/${classId}/date/${date}`),
  
  getByStudent: (studentId: number) => 
    apiRequest("GET", `/api/attendance/student/${studentId}`),
  
  facialRecognition: (formData: FormData) => 
    fetch("/api/attendance/facial-recognition", {
      method: "POST",
      body: formData,
      credentials: "include",
    }),
};

// Dashboard API
export const dashboardApi = {
  getTeacherStats: (teacherId: number) => 
    apiRequest("GET", `/api/dashboard/teacher/${teacherId}`),
  
  getStudentStats: (studentId: number) => 
    apiRequest("GET", `/api/dashboard/student/${studentId}`),
  
  getParentStats: (parentId: number) => 
    apiRequest("GET", `/api/dashboard/parent/${parentId}`),
};

// Notifications API
export const notificationsApi = {
  getByUser: (userId: number) => 
    apiRequest("GET", `/api/notifications/${userId}`),
  
  markAsRead: (notificationId: number) => 
    apiRequest("PATCH", `/api/notifications/${notificationId}/read`),
};

// System API
export const systemApi = {
  initSampleData: () => 
    apiRequest("POST", "/api/init-sample-data"),
};
