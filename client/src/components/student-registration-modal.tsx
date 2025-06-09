import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  grade: z.string().min(1, "Grade is required"),
  section: z.string().min(1, "Section is required"),
  parentId: z.number().optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentRegistrationModal({ isOpen, onClose }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentId: "",
      firstName: "",
      lastName: "",
      grade: "",
      section: "",
      parentId: 1, // Default to first parent for demo
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
    }
  };

  const onSubmit = async (data: StudentForm) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to register student');
      }

      const result = await response.json();
      
      toast({
        title: "Student registered successfully",
        description: `${data.firstName} ${data.lastName} has been added to the system.`,
      });

      // Invalidate students query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      
      // Reset form and close modal
      form.reset();
      setSelectedPhoto(null);
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedPhoto(null);
    onClose();
  };

  const preRegisteredStudents = [
    { name: "Alex Johnson", id: "STU001", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
    { name: "Sarah Chen", id: "STU002", image: "https://pixabay.com/get/g247a71a9ae678e2a2ca77efd4385cfc0ec7336459f88cbf286ea1feb1984f732832bd152613a7c40114cf2f7ca4d2e6b8b747595b2fdd8f4ad6aeee2fddfd778_1280.jpg" },
    { name: "Marcus Williams", id: "STU003", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
    { name: "Emma Davis", id: "STU004", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80" },
    { name: "Michael Brown", id: "STU005", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Register New Student</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter first name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter last name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter student ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Capture Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4 inline-block">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      {selectedPhoto ? selectedPhoto.name : "Capture or upload student photo for facial recognition"}
                    </p>
                    <div className="flex justify-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pre-registered Students */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pre-registered Students</h4>
              <div className="grid grid-cols-5 gap-4">
                {preRegisteredStudents.map((student, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-1 overflow-hidden">
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.id}</p>
                  </div>
                ))}
              </div>
              
              <Card className="mt-4 bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-800">
                      These 5 students have been pre-registered and will be recognized when the group photo is uploaded for attendance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register Student"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
