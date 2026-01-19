# Campus Connect - College Notice Board System

A modern, real-time notice board system for colleges built with React, TypeScript, and Firebase.

## 🚀 Features

- **Real-time Notice Management** - Create, edit, and delete notices instantly
- **Role-based Access Control** - Different permissions for students, teachers, and admins
- **Category-wise Organization** - Organize notices by exams, events, sports, etc.
- **File Attachments** - Support for PDFs, images, and documents
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Firebase Integration** - Real-time database and file storage
- **Modern UI** - Built with shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui, Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/campus-connect.git
cd campus-connect
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore, Storage, and Authentication
   - Update Firebase config in `src/lib/firebase.ts`

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configs
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## 👥 User Roles

- **Students**: View notices, filter by category, download attachments
- **Teachers**: Create and manage notices, view analytics
- **Admins**: Full system access, user management, system settings

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

The project can be deployed to:
- Vercel
- Netlify
- Firebase Hosting
- Any static hosting service

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Contributors

- Your Name - Initial work

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request