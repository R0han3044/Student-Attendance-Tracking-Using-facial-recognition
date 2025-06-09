import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import FacialRecognitionModal from "@/components/facial-recognition-modal";
import StudentRegistrationModal from "@/components/student-registration-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, UserPlus, Users, CheckCircle, AlertTriangle, Percent, Download } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface Props {
  user: User;
}

export default function TeacherDashboard({ user }: Props) {
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const [showStudentRegistration, setShowStudentRegistration] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/dashboard/teacher/${user.id}`],
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: todayAttendance, isLoading: attendanceLoading } = useQuery({
    queryKey: [`/api/attendance/class/1/date/${format(new Date(), 'yyyy-MM-dd')}`],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="status-present">Present</Badge>;
      case 'absent':
        return <Badge className="status-absent">Absent</Badge>;
      case 'late':
        return <Badge className="status-late">Late</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Manage attendance and track student progress</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowFacialRecognition(true)}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Take Attendance</span>
              </Button>
              <Button 
                onClick={() => setShowStudentRegistration(true)}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Student</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.totalStudents || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Present Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.presentToday || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-accent" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Absent Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.absentToday || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Percent className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : `${stats?.attendanceRate || 0}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Today's Attendance</CardTitle>
                  <p className="text-sm text-gray-600">Recent attendance records for your classes</p>
                </div>
                <div className="flex space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayAttendance?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No attendance records for today
                          </TableCell>
                        </TableRow>
                      ) : (
                        todayAttendance?.map((record: any) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {record.student?.firstName?.[0]}{record.student?.lastName?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {record.student?.firstName} {record.student?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {record.student?.studentId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>Mathematics</TableCell>
                            <TableCell>
                              {record.timeIn ? format(new Date(record.timeIn), 'HH:mm') : '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button variant="ghost" size="sm">Details</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <FacialRecognitionModal 
        isOpen={showFacialRecognition}
        onClose={() => setShowFacialRecognition(false)}
      />
      <StudentRegistrationModal
        isOpen={showStudentRegistration}
        onClose={() => setShowStudentRegistration(false)}
      />
    </div>
  );
}
