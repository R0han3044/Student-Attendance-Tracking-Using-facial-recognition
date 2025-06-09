import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck, Calendar, Clock } from "lucide-react";

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

export default function StudentDashboard({ user }: Props) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/dashboard/student/${user.id}`],
  });

  const subjects = [
    { name: "Mathematics", percentage: 92, present: 23, absent: 2 },
    { name: "Science", percentage: 88, present: 22, absent: 3 },
    { name: "History", percentage: 76, present: 19, absent: 6 },
    { name: "English", percentage: 94, present: 24, absent: 1 },
    { name: "Physical Education", percentage: 100, present: 25, absent: 0 },
    { name: "Art", percentage: 82, present: 20, absent: 4 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Track your attendance and academic progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-500">Student ID: STU002</p>
              </div>
            </div>
          </div>

          {/* Attendance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CalendarCheck className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : `${stats?.attendancePercentage || 0}%`}
                    </div>
                    <div className="text-sm text-gray-500">Overall Attendance</div>
                    <div className="mt-2">
                      <Progress 
                        value={parseFloat(stats?.attendancePercentage || "0")} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.absentDays || 0}
                    </div>
                    <div className="text-sm text-gray-500">Days Absent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.lateDays || 0}
                    </div>
                    <div className="text-sm text-gray-500">Late Arrivals</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject-wise Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
              <p className="text-sm text-gray-600">Your attendance record across different subjects</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <span className={`text-sm font-semibold ${
                        subject.percentage >= 90 ? 'text-secondary' : 
                        subject.percentage >= 80 ? 'text-accent' : 'text-destructive'
                      }`}>
                        {subject.percentage}%
                      </span>
                    </div>
                    <Progress value={subject.percentage} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{subject.present} Present</span>
                      <span>{subject.absent} Absent</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
