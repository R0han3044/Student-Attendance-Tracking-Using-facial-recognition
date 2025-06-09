import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Settings, Check, Clock, TrendingUp } from "lucide-react";

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

export default function ParentDashboard({ user }: Props) {
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: [`/api/dashboard/parent/${user.id}`],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: [`/api/notifications/${user.id}`],
  });

  const mockNotifications = [
    {
      id: 1,
      type: 'attendance',
      title: 'Sarah marked present in Mathematics',
      description: 'Your child was automatically marked present using facial recognition',
      time: '9:16 AM',
      isRead: false,
    },
    {
      id: 2,
      type: 'late',
      title: 'Sarah arrived late to Science class',
      description: 'Arrived 15 minutes after class started',
      time: 'Yesterday',
      isRead: true,
    },
    {
      id: 3,
      type: 'report',
      title: 'Weekly attendance report available',
      description: "Sarah's attendance rate improved to 85.5% this week",
      time: '2 days ago',
      isRead: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'report':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Check className="h-4 w-4 text-gray-600" />;
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Monitor your child's attendance and receive updates</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>

          {/* Child Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {childrenLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              children?.map((child: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium">
                          {child.firstName?.[0]}{child.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {child.firstName} {child.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Grade {child.grade} - Section {child.section}
                        </p>
                        <p className="text-sm text-gray-500">
                          Student ID: {child.studentId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">
                          {child.attendancePercentage || 85.5}%
                        </div>
                        <div className="text-xs text-gray-500">Attendance Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {child.presentDays || 171}
                        </div>
                        <div className="text-xs text-gray-500">Days Present</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Today's Status:</span>
                        {getStatusBadge('present')}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-sm text-gray-500">9:16 AM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || [
                // Fallback mock data for Sarah Chen
                <Card key="sarah">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium">SC</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Sarah Chen</h3>
                        <p className="text-sm text-gray-500">Grade 10 - Section A</p>
                        <p className="text-sm text-gray-500">Student ID: STU002</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">85.5%</div>
                        <div className="text-xs text-gray-500">Attendance Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">171</div>
                        <div className="text-xs text-gray-500">Days Present</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Today's Status:</span>
                        {getStatusBadge('present')}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-sm text-gray-500">9:16 AM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ]
            )}
          </div>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Notifications</CardTitle>
                  <p className="text-sm text-gray-600">Latest updates about your child's attendance</p>
                </div>
                <Button variant="ghost" className="text-primary hover:text-blue-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(notifications || mockNotifications).map((notification: any) => (
                    <div 
                      key={notification.id}
                      className={`flex space-x-3 p-4 rounded-lg ${
                        notification.isRead ? 'notification-read' : 'notification-unread'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500">{notification.time}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {notification.description || notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
