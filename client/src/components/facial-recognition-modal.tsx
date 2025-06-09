import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FacialRecognitionModal({ isOpen, onClose }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('classId', '1'); // Mathematics class ID

      const response = await fetch('/api/attendance/facial-recognition', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Facial recognition failed');
      }

      const result = await response.json();
      setRecognitionResults(result);
      
      if (result.success) {
        toast({
          title: "Attendance marked successfully",
          description: `Recognized ${result.recognizedStudents} students and marked ${result.attendanceMarked} attendance records.`,
        });
        
        // Invalidate attendance queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      }
    } catch (error: any) {
      toast({
        title: "Recognition failed",
        description: error.message || "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAttendance = () => {
    if (recognitionResults?.success) {
      toast({
        title: "Attendance processed",
        description: "All recognized students have been marked present.",
      });
      onClose();
      setRecognitionResults(null);
    }
  };

  const handleClose = () => {
    onClose();
    setRecognitionResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Facial Recognition Attendance</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Camera/Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-4 relative camera-feed">
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-75" />
                  <p className="text-lg mb-2">Upload Group Photo</p>
                  <p className="text-sm opacity-75">Upload the group photo to automatically mark attendance</p>
                  
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : "Select Image"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recognition Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recognition Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {recognitionResults?.totalFaces || 0} faces detected
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {recognitionResults?.recognizedStudents || 0} faces recognized
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {(recognitionResults?.totalFaces || 0) - (recognitionResults?.recognizedStudents || 0)} unknown faces
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recognized Students</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {recognitionResults?.recognitions?.map((recognition: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">
                            Student ID: {recognition.studentId} ({recognition.confidence}% confidence)
                          </span>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">No students recognized yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessAttendance}
              disabled={!recognitionResults?.success || isProcessing}
            >
              {isProcessing ? "Processing..." : "Mark Attendance"}
            </Button>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload a clear group photo of students</li>
                    <li>• Ensure faces are visible and well-lit</li>
                    <li>• The system will automatically recognize registered students</li>
                    <li>• Attendance will be marked for all recognized students</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
