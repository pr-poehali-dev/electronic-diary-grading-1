import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import LoginPage from '@/components/LoginPage';
import AdminPanel from '@/components/AdminPanel';
import TeacherPanel from '@/components/TeacherPanel';
import StudentPanel from '@/components/StudentPanel';

const API_AUTH_URL = 'https://functions.poehali.dev/03cbcc60-a6ca-4440-adc5-7ddcaa8efe20';
const API_URL = 'https://functions.poehali.dev/bfbeda34-cef5-4bdd-946d-7a5dcae64e26';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  fullName: string;
  email?: string;
  phone?: string;
  className?: string;
}

interface Subject {
  id: number;
  name: string;
  description?: string;
}

interface Grade {
  id: number;
  grade: number;
  comment?: string;
  grade_date: string;
  subject_name: string;
  teacher_name?: string;
  student_name?: string;
  student_id?: number;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  deadline: string;
  comment?: string;
  subject_name: string;
  teacher_name?: string;
  class_name?: string;
}

interface Stats {
  total: number;
  excellent: number;
  good: number;
  average: number;
}

const Index = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (isLoggedIn && user) {
      loadSubjects();
      if (user.role === 'admin') {
        loadUsers();
      } else if (user.role === 'student') {
        loadStudentData();
      } else if (user.role === 'teacher') {
        loadTeacherData();
      }
    }
  }, [isLoggedIn, user]);

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        toast({ title: 'Успешно', description: `Добро пожаловать, ${data.user.fullName}!` });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Неверный логин или пароль', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_subjects`);
      const data = await response.json();
      if (response.ok) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadUsers = async (role?: string) => {
    try {
      const url = role ? `${API_URL}?action=get_users&role=${role}` : `${API_URL}?action=get_users`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStudentData = async () => {
    if (!user) return;
    
    try {
      const [gradesRes, homeworkRes, statsRes] = await Promise.all([
        fetch(`${API_URL}?action=get_grades&studentId=${user.id}`),
        fetch(`${API_URL}?action=get_homework&className=${user.className}`),
        fetch(`${API_URL}?action=get_stats&studentId=${user.id}`)
      ]);

      const [gradesData, homeworkData, statsData] = await Promise.all([
        gradesRes.json(),
        homeworkRes.json(),
        statsRes.json()
      ]);

      if (gradesRes.ok) setGrades(gradesData.grades);
      if (homeworkRes.ok) setHomework(homeworkData.homework);
      if (statsRes.ok) setStats(statsData);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const loadTeacherData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}?action=get_homework&teacherId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setHomework(data.homework);
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setLoginForm({ username: '', password: '' });
    setGrades([]);
    setHomework([]);
    setUsers([]);
    setStats(null);
  };

  const getGradeColor = (grade: number) => {
    if (grade === 5) return 'bg-green-100 text-green-800 border-green-300';
    if (grade === 4) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Icon name="GraduationCap" size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Электронный дневник</h1>
              <p className="text-sm text-slate-500">Школа №42</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-semibold text-slate-900">{user?.fullName}</p>
              <p className="text-sm text-slate-500">
                {user?.role === 'admin' ? 'Администратор' : user?.role === 'teacher' ? 'Учитель' : `Класс ${user?.className}`}
              </p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-primary text-white">
                {user?.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user?.role === 'admin' && (
          <AdminPanel
            user={user}
            subjects={subjects}
            users={users}
            loadUsers={loadUsers}
            toast={toast}
            getGradeColor={getGradeColor}
          />
        )}
        {user?.role === 'teacher' && (
          <TeacherPanel
            user={user}
            subjects={subjects}
            homework={homework}
            loadTeacherData={loadTeacherData}
            toast={toast}
          />
        )}
        {user?.role === 'student' && (
          <StudentPanel
            user={user}
            grades={grades}
            homework={homework}
            stats={stats}
            getGradeColor={getGradeColor}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
