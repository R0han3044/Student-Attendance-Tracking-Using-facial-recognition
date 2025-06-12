# 📸 Face-Based Attendance System

This project is a **Face Recognition-based Attendance Management System** built using Python, OpenCV, and machine learning. It allows institutions to automate attendance by recognizing students' faces in real-time through a webcam or camera feed.

---

## 🚀 Features

- Real-time face detection and recognition
- Automatic attendance marking and storage
- Student registration with image data
- Attendance report generation
- User-friendly GUI (Tkinter)
- Support for training with multiple faces

---

## 🛠️ Technologies Used

- **Language**: Python
- **Libraries**:
  - OpenCV
  - face_recognition
  - NumPy
  - Pandas
  - Tkinter (for GUI)
- **Tools**: VS Code, GitHub, Jupyter (optional)

---

## 📂 Project Structure

```bash
Face-Based-Attendance-System/
│
├── dataset/                  # Stores registered face images
├── attendance/               # CSV logs of attendance
├── trainer/                  # Trained model files
├── main.py                   # Main GUI application
├── training.py               # Model training script
├── face_recognition.py       # Face recognition logic
├── register.py               # User registration module
├── README.md                 # Project documentation


**🧑‍🎓 How It Works
Register a student by capturing their face using a webcam.

Train the recognition model using the registered images.

Start the recognition module — system will mark present if face matches.

Attendance saved in a CSV file with timestamp.

**🖥️ Setup Instructions
1)Clone the Repository
git clone https://github.com/sathwik148/Face-Based-Attendace-System.git
cd Face-Based-Attendace-System

2) Install Dependencies
pip install opencv-python face_recognition numpy pandas
pip install pillow

3)Run the App
python main.py


**📈 Sample Attendance Output
Name	Date	Time
Sathwik	12-06-2025	09:10 AM
Harsha	12-06-2025	09:11 AM

**🤝 Contributing
Want to improve the model or interface? PRs are welcome!

**📄 License
This project is licensed under the MIT License.

**🙋‍♂️ Author
Sathwik Reddy
🔗 GitHub: sathwik148



