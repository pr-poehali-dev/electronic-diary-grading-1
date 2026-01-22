import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Icon name="GraduationCap" size={48} className="text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Электронный дневник</CardTitle>
            <CardDescription>Войдите в систему для доступа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="kostya"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </CardContent>
        </Card>
      </div>
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
        {user?.role === 'admin' && <AdminPanel user={user} subjects={subjects} users={users} loadUsers={loadUsers} toast={toast} getGradeColor={getGradeColor} />}
        {user?.role === 'teacher' && <TeacherPanel user={user} subjects={subjects} homework={homework} loadTeacherData={loadTeacherData} toast={toast} />}
        {user?.role === 'student' && <StudentPanel user={user} grades={grades} homework={homework} stats={stats} getGradeColor={getGradeColor} />}
      </main>
    </div>
  );
};

function AdminPanel({ user, subjects, users, loadUsers, toast, getGradeColor }: any) {
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '', fullName: '', email: '', phone: '', className: '' });

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.role || !newUser.fullName) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=create_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, createdBy: user.id })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Пользователь создан' });
        setNewUser({ username: '', password: '', role: '', fullName: '', email: '', phone: '', className: '' });
        loadUsers();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать пользователя', variant: 'destructive' });
    }
  };

  const [allGrades, setAllGrades] = useState<Grade[]>([]);

  useEffect(() => {
    loadAllGrades();
  }, []);

  const loadAllGrades = async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_all_grades`);
      const data = await response.json();
      if (response.ok) {
        setAllGrades(data.grades);
      }
    } catch (error) {
      console.error('Error loading all grades:', error);
    }
  };

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList>
        <TabsTrigger value="users">Пользователи</TabsTrigger>
        <TabsTrigger value="journal">Журнал оценок</TabsTrigger>
        <TabsTrigger value="create">Создать пользователя</TabsTrigger>
        <TabsTrigger value="subjects">Предметы</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Все пользователи</CardTitle>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => loadUsers()}>Все</Button>
              <Button size="sm" variant="outline" onClick={() => loadUsers('teacher')}>Учителя</Button>
              <Button size="sm" variant="outline" onClick={() => loadUsers('student')}>Ученики</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Логин</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Класс</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : u.role === 'teacher' ? 'secondary' : 'outline'}>
                        {u.role === 'admin' ? 'Администратор' : u.role === 'teacher' ? 'Учитель' : 'Ученик'}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.class_name || '-'}</TableCell>
                    <TableCell>{u.email || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="journal">
        <Card>
          <CardHeader>
            <CardTitle>Журнал оценок всех учеников</CardTitle>
            <CardDescription>Все оценки, выставленные в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Ученик</TableHead>
                  <TableHead>Предмет</TableHead>
                  <TableHead>Оценка</TableHead>
                  <TableHead>Учитель</TableHead>
                  <TableHead>Комментарий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">
                      Нет оценок
                    </TableCell>
                  </TableRow>
                ) : (
                  allGrades.map((grade: any) => (
                    <TableRow key={grade.id}>
                      <TableCell className="text-sm">{grade.grade_date}</TableCell>
                      <TableCell className="font-medium">{grade.student_name}</TableCell>
                      <TableCell>{grade.subject_name}</TableCell>
                      <TableCell>
                        <Badge className={`${getGradeColor(grade.grade)} border font-bold`}>
                          {grade.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{grade.teacher_name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{grade.comment || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Создать нового пользователя</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ФИО *</Label>
                <Input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} placeholder="Иванов Иван Иванович" />
              </div>
              <div className="space-y-2">
                <Label>Роль *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Учитель</SelectItem>
                    <SelectItem value="student">Ученик</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Логин *</Label>
                <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="ivanov" />
              </div>
              <div className="space-y-2">
                <Label>Пароль *</Label>
                <Input value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="********" />
              </div>
              {newUser.role === 'student' && (
                <div className="space-y-2">
                  <Label>Класс</Label>
                  <Input value={newUser.className} onChange={(e) => setNewUser({ ...newUser, className: e.target.value })} placeholder="9-А" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="ivanov@school.ru" />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="+7 (999) 123-45-67" />
              </div>
            </div>
            <Button onClick={handleCreateUser}>Создать пользователя</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subjects">
        <Card>
          <CardHeader>
            <CardTitle>Все предметы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject: Subject) => (
                <Card key={subject.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{subject.name}</CardTitle>
                    {subject.description && <CardDescription className="text-xs">{subject.description}</CardDescription>}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function TeacherPanel({ user, subjects, homework, loadTeacherData, toast }: any) {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [newGrade, setNewGrade] = useState({ studentId: '', subjectId: '', grade: '', comment: '' });
  const [newHomework, setNewHomework] = useState({ subjectId: '', className: '', title: '', description: '', deadline: '', comment: '' });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_users&role=student`);
      const data = await response.json();
      if (response.ok) {
        setStudents(data.users);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleCreateGrade = async () => {
    if (!newGrade.studentId || !newGrade.subjectId || !newGrade.grade) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=create_grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(newGrade.studentId),
          subjectId: parseInt(newGrade.subjectId),
          teacherId: user.id,
          grade: parseInt(newGrade.grade),
          comment: newGrade.comment
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Оценка выставлена' });
        setNewGrade({ studentId: '', subjectId: '', grade: '', comment: '' });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось выставить оценку', variant: 'destructive' });
    }
  };

  const handleCreateHomework = async () => {
    if (!newHomework.subjectId || !newHomework.className || !newHomework.title || !newHomework.description || !newHomework.deadline) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=create_homework`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: parseInt(newHomework.subjectId),
          teacherId: user.id,
          className: newHomework.className,
          title: newHomework.title,
          description: newHomework.description,
          deadline: newHomework.deadline,
          comment: newHomework.comment
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Задание создано' });
        setNewHomework({ subjectId: '', className: '', title: '', description: '', deadline: '', comment: '' });
        loadTeacherData();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать задание', variant: 'destructive' });
    }
  };

  return (
    <Tabs defaultValue="grades" className="space-y-6">
      <TabsList>
        <TabsTrigger value="grades">Выставить оценку</TabsTrigger>
        <TabsTrigger value="homework">Домашние задания</TabsTrigger>
        <TabsTrigger value="create-homework">Создать задание</TabsTrigger>
      </TabsList>

      <TabsContent value="grades">
        <Card>
          <CardHeader>
            <CardTitle>Выставить оценку</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ученик *</Label>
                <Select value={newGrade.studentId} onValueChange={(value) => setNewGrade({ ...newGrade, studentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ученика" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.full_name} ({student.class_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Предмет *</Label>
                <Select value={newGrade.subjectId} onValueChange={(value) => setNewGrade({ ...newGrade, subjectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject: Subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Оценка *</Label>
                <Select value={newGrade.grade} onValueChange={(value) => setNewGrade({ ...newGrade, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 (Отлично)</SelectItem>
                    <SelectItem value="4">4 (Хорошо)</SelectItem>
                    <SelectItem value="3">3 (Удовлетворительно)</SelectItem>
                    <SelectItem value="2">2 (Неудовлетворительно)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea value={newGrade.comment} onChange={(e) => setNewGrade({ ...newGrade, comment: e.target.value })} placeholder="Комментарий к оценке" rows={3} />
            </div>
            <Button onClick={handleCreateGrade}>Выставить оценку</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="homework">
        <Card>
          <CardHeader>
            <CardTitle>Мои домашние задания</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {homework.map((hw: Homework) => (
                <Card key={hw.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{hw.title}</CardTitle>
                        <CardDescription>{hw.subject_name} • Класс {hw.class_name}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        <Icon name="Calendar" size={14} className="mr-1" />
                        {hw.deadline}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 mb-2">{hw.description}</p>
                    {hw.comment && (
                      <div className="bg-amber-50 p-2 rounded text-sm">
                        <p className="text-amber-900">{hw.comment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="create-homework">
        <Card>
          <CardHeader>
            <CardTitle>Создать домашнее задание</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Предмет *</Label>
                <Select value={newHomework.subjectId} onValueChange={(value) => setNewHomework({ ...newHomework, subjectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject: Subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Класс *</Label>
                <Input value={newHomework.className} onChange={(e) => setNewHomework({ ...newHomework, className: e.target.value })} placeholder="9-А" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Название *</Label>
                <Input value={newHomework.title} onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })} placeholder="Учебник стр. 45" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Описание *</Label>
                <Textarea value={newHomework.description} onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })} placeholder="Решить задачи №12-18" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Срок сдачи *</Label>
                <Input type="date" value={newHomework.deadline} onChange={(e) => setNewHomework({ ...newHomework, deadline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Указания</Label>
                <Textarea value={newHomework.comment} onChange={(e) => setNewHomework({ ...newHomework, comment: e.target.value })} placeholder="Дополнительные указания" rows={3} />
              </div>
            </div>
            <Button onClick={handleCreateHomework}>Создать задание</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function StudentPanel({ user, grades, homework, stats, getGradeColor }: any) {
  return (
    <Tabs defaultValue="home" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="home">Главная</TabsTrigger>
        <TabsTrigger value="grades">Оценки</TabsTrigger>
        <TabsTrigger value="homework">Домашние задания</TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Средний балл</CardTitle>
              <Icon name="TrendingUp" size={20} className="text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.average || 0}</div>
              <p className="text-xs text-slate-500 mt-1">За текущий период</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Отличных оценок</CardTitle>
              <Icon name="Award" size={20} className="text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.excellent || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Оценок "5"</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Хороших оценок</CardTitle>
              <Icon name="Award" size={20} className="text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.good || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Оценок "4"</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Award" size={20} />
                Последние оценки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {grades.slice(0, 5).map((item: Grade) => (
                <div key={item.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.subject_name}</p>
                    <p className="text-sm text-slate-500">{item.grade_date}</p>
                  </div>
                  <Badge className={`${getGradeColor(item.grade)} border font-bold text-lg`}>
                    {item.grade}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={20} />
                Ближайшие задания
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {homework.slice(0, 5).map((item: Homework) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-slate-900">{item.subject_name}</p>
                    <Badge variant="outline" className="text-xs">
                      <Icon name="Clock" size={12} className="mr-1" />
                      {item.deadline}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{item.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="grades">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Award" size={24} />
              Журнал оценок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grades.map((item: Grade) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">{item.subject_name}</h3>
                      <p className="text-sm text-slate-500">
                        <Icon name="User" size={14} className="inline mr-1" />
                        {item.teacher_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getGradeColor(item.grade)} border font-bold text-xl px-4 py-2`}>
                        {item.grade}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">{item.grade_date}</p>
                    </div>
                  </div>
                  {item.comment && (
                    <>
                      <Separator className="my-3" />
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                          <Icon name="MessageCircle" size={16} />
                          Комментарий учителя:
                        </p>
                        <p className="text-sm text-blue-800">{item.comment}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="homework">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={24} />
              Домашние задания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {homework.map((item: Homework) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">{item.subject_name}</h3>
                      <p className="text-sm text-slate-500">
                        <Icon name="User" size={14} className="inline mr-1" />
                        {item.teacher_name}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {item.deadline}
                    </Badge>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg mb-3">
                    <p className="font-semibold text-slate-900 mb-1">{item.title}</p>
                    <p className="text-slate-700 text-sm">{item.description}</p>
                  </div>
                  {item.comment && (
                    <>
                      <Separator className="my-3" />
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                          <Icon name="Info" size={16} />
                          Указания учителя:
                        </p>
                        <p className="text-sm text-amber-800">{item.comment}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default Index;