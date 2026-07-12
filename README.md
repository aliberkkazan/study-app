<div align="center">

# Study App

### A mentor–student study management application built with React Native

Study App helps students organize their learning process, follow mentor-assigned tasks, improve focus with Pomodoro sessions, and submit their work for review.

[![App Store](https://img.shields.io/badge/App_Store-Download-000000?style=for-the-badge&logo=apple&logoColor=white)](https://apps.apple.com/us/app/study-app-mentor-student/id6758196655)
[![Backend](https://img.shields.io/badge/Backend-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aliberkkazan/study-app-backend)

</div>

---

## About the Project

**Study App - Mentor & Student** is a role-based education application designed to create a structured workflow between students and mentors.

Students can connect with a mentor, follow assigned study tasks, use a built-in Pomodoro timer, and upload photos of completed tests or homework.

Mentors can manage multiple students, assign study tasks, review uploaded work, and provide feedback through the application.

The application is currently available on the Apple App Store.

---

## Features

### Student Experience

- Create and manage a student account
- Connect with a mentor using a mentor code
- View mentor-assigned study tasks
- Track assigned work and completion status
- Use the built-in Pomodoro focus timer
- Upload test and homework images
- Review previous submissions
- View feedback provided by the mentor

### Mentor Experience

- Create and manage a mentor account
- Generate and share a unique mentor code
- Review student connection requests
- Accept or reject student requests
- Manage connected students
- Create and assign study tasks
- Track student progress
- Review uploaded tests and homework
- Provide feedback on student submissions

---

## Tech Stack

<p>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/React_Navigation-6B52AE?style=flat-square&logo=react&logoColor=white" alt="React Navigation" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/Reanimated-001A72?style=flat-square&logo=react&logoColor=white" alt="React Native Reanimated" />
  <img src="https://img.shields.io/badge/Lottie-00DDB3?style=flat-square&logo=airbnb&logoColor=white" alt="Lottie" />
  <img src="https://img.shields.io/badge/iOS-000000?style=flat-square&logo=apple&logoColor=white" alt="iOS" />
</p>

- **React Native CLI** for cross-platform mobile development
- **TypeScript** for type-safe application development
- **Redux Toolkit** and React Redux for global state management
- **React Navigation** for role-based stack and tab navigation
- **Axios** for communication with the backend REST API
- **React Native Reanimated** for animations and interactions
- **Lottie** for animated visual elements
- **React Native Image Picker** for test and homework uploads
- **date-fns** for date and time operations

---

## Application Architecture

The application follows a modular, role-based structure.

```text
src/
├── api/          # Axios client and API configuration
├── assets/       # Images, icons and animations
├── components/   # Reusable UI components
├── constant/     # Shared application constants
├── helper/       # Helper functions
├── navigators/   # Root, student and mentor navigation
├── redux/        # Redux store and application slices
├── screens/
│   ├── Auth/     # Authentication screens
│   ├── Common/   # Shared screens
│   ├── Mentor/   # Mentor-specific features
│   └── Student/  # Student-specific features
├── theme/        # Colors and application styling
├── types/        # Shared TypeScript definitions
└── utils/        # Utility functions
```

---

## Navigation

Study App uses role-based navigation.

After authentication, users are directed to the appropriate application flow based on their account role:

- **Student Navigator**
- **Mentor Navigator**

Each role has its own screens, actions, and bottom-tab navigation structure.

---

## API Integration

The mobile application communicates with the Study App backend through an Axios client.

The API base URL is loaded from the environment configuration:

```env
API_URL=http://localhost:3000
```

Authentication tokens are attached to protected requests using the Bearer authentication scheme.

The backend source code is available here:

[Study App Backend](https://github.com/aliberkkazan/study-app-backend)

---

## Getting Started

### Requirements

Before running the project, make sure the following tools are installed:

- Node.js 18 or newer
- Yarn or npm
- Xcode
- CocoaPods
- Android Studio for Android development
- A running Study App backend API

---

### Installation

Clone the repository:

```bash
git clone https://github.com/aliberkkazan/study-app.git
cd study-app
```

Install JavaScript dependencies:

```bash
yarn install
```

Install iOS dependencies:

```bash
cd ios
pod install
cd ..
```

---

### Environment Configuration

Create a `.env` file in the project root:

```env
API_URL=http://localhost:3000
```

When running the application on a physical device, replace `localhost` with the local network IP address of the computer running the backend.

Example:

```env
API_URL=http://192.168.1.100:3000
```

Do not commit production credentials or sensitive environment variables to the repository.

---

## Running the Application

Start Metro Bundler:

```bash
yarn start
```

Run the iOS application:

```bash
yarn ios
```

Run the Android application:

```bash
yarn android
```

---

## Code Quality

Run ESLint:

```bash
yarn lint
```

Run tests:

```bash
yarn test
```

---

## App Store

Study App is published on the Apple App Store as:

### Study App - Mentor & Student

The application is designed for iPhone and provides dedicated experiences for both students and mentors.

[View Study App on the App Store](https://apps.apple.com/us/app/study-app-mentor-student/id6758196655)

---

## Related Repository

The NestJS backend API is maintained in a separate repository:

[Study App Backend](https://github.com/aliberkkazan/study-app-backend)

---

## Author

Developed by **Ali Berk Kazan**

- [GitHub Profile](https://github.com/aliberkkazan)
- [App Store Developer Profile](https://apps.apple.com/au/developer/ali-berk-kazan/id1871383287)

---

<div align="center">

Built with React Native and TypeScript.

</div>
