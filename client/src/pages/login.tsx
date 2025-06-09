import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Users, Bell } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Login successful",
        description: "Welcome to StudentTrackr!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSampleData = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/init-sample-data");
      toast({
        title: "Sample data initialized",
        description: "You can now log in with demo accounts",
      });
    } catch (error: any) {
      toast({
        title: "Initialization failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Camera className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">StudentTrackr</h1>
          </div>
          <p className="text-gray-600">Facial Recognition Attendance System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the attendance system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" autoComplete="username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" autoComplete="current-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">Demo System</p>
                <Button
                  onClick={initializeSampleData}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Initialize Sample Data
                </Button>
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Teacher:</span>
                    <span>prof.johnson / password123</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Parent:</span>
                    <span>parent1 / password123</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <Camera className="h-6 w-6 text-primary mx-auto" />
            <p className="text-xs text-gray-600">Facial Recognition</p>
          </div>
          <div className="space-y-2">
            <Users className="h-6 w-6 text-secondary mx-auto" />
            <p className="text-xs text-gray-600">Multi-Role Access</p>
          </div>
          <div className="space-y-2">
            <Bell className="h-6 w-6 text-accent mx-auto" />
            <p className="text-xs text-gray-600">Real-time Notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
