<div align="center">

# Study App

### A mentor–student study management application built with React Native

Study App helps students organize their study process, follow mentor-created programs, stay focused with Pomodoro sessions, and submit their work for review.

[View on the App Store](https://apps.apple.com/us/app/study-app-mentor-student/id6758196655) · [Backend Repository](https://github.com/aliberkkazan/study-app-backend)

</div>

---

## About the Project

Study App is a role-based mobile application designed to create a structured workflow between students and mentors.

Students can connect with a mentor, follow personalized study programs, manage focus sessions, and upload test or homework results. Mentors can manage their students, prepare study programs, review submissions, and provide feedback.

The application is currently published on the Apple App Store.

## Features

### For Students

- Register and sign in with a student account
- Connect with a mentor using a unique mentor code
- Follow assigned study programs
- Use a built-in Pomodoro focus timer
- Upload test and homework images
- View previous submissions and mentor reviews
- Track study tasks and progress

### For Mentors

- Register and sign in with a mentor account
- Share and refresh a unique mentor code
- Accept or reject student connection requests
- View and manage connected students
- Create and edit study programs
- Review student test submissions
- Provide structured feedback

## Tech Stack

<p>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/React_Navigation-6B52AE?style=flat-square&logo=react&logoColor=white" alt="React Navigation" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/iOS-000000?style=flat-square&logo=apple&logoColor=white" alt="iOS" />
</p>

## Application Architecture

The application follows a modular React Native structure:

```text
src/
├── api/          # Axios client and API configuration
├── assets/       # Images, icons and animations
├── components/   # Reusable UI components
├── navigators/   # Role-based application navigation
├── redux/        # Authentication and application state
├── screens/
│   ├── Auth/     # Login and registration
│   ├── Mentor/   # Mentor management and review flows
│   └── Student/  # Programs, Pomodoro and submissions
├── theme/        # Application theme
├── types/        # TypeScript types
└── utils/        # Shared utilities
