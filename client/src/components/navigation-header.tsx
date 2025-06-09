import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function NavigationHeader({ user }: Props) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleNavigation = () => {
    const roles = [
      { key: 'teacher', label: 'Teacher', path: '/teacher' },
      { key: 'student', label: 'Student', path: '/student' },
      { key: 'parent', label: 'Parent', path: '/parent' },
    ];

    return roles.map((role) => (
      <Button
        key={role.key}
        variant={user.role === role.key ? "default" : "ghost"}
        onClick={() => setLocation(role.path)}
        className="text-sm"
      >
        {role.label}
      </Button>
    ));
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Camera className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">StudentTrackr</h1>
              </div>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {getRoleNavigation()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
