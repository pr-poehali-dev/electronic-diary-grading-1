import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import GradeJournal from '@/components/GradeJournal';

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

interface AdminPanelProps {
  user: User;
  subjects: Subject[];
  users: any[];
  loadUsers: (role?: string) => void;
  toast: any;
  getGradeColor: (grade: number) => string;
}

const AdminPanel = ({ user, subjects, users, loadUsers, toast, getGradeColor }: AdminPanelProps) => {
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '', fullName: '', email: '', phone: '', className: '' });
  const [allGrades, setAllGrades] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

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

  const openDeleteDialog = (u: any) => {
    setUserToDelete(u);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`${API_URL}?action=delete_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.id })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Пользователь удалён' });
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        loadUsers();
        loadAllGrades();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить пользователя', variant: 'destructive' });
    }
  };

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList>
        <TabsTrigger value="users">Пользователи</TabsTrigger>
        <TabsTrigger value="grade-journal">Журнал оценок</TabsTrigger>
        <TabsTrigger value="journal">История оценок</TabsTrigger>
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
                  <TableHead className="text-right">Действия</TableHead>
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
                    <TableCell className="text-right">
                      {u.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(u)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="grade-journal">
        <GradeJournal user={user} subjects={subjects} toast={toast} />
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
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <div className={`${getGradeColor(grade.grade)} w-8 h-8 flex items-center justify-center rounded font-bold text-sm`}>
                            {grade.grade}
                          </div>
                        </div>
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

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить пользователя <strong>{userToDelete?.full_name}</strong>? 
            Это действие нельзя отменить. Все оценки и задания этого пользователя будут удалены.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};

export default AdminPanel;