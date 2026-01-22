import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

interface TeacherPanelProps {
  user: User;
  subjects: Subject[];
  homework: Homework[];
  loadTeacherData: () => void;
  toast: any;
}

const TeacherPanel = ({ user, subjects, homework, loadTeacherData, toast }: TeacherPanelProps) => {
  const [students, setStudents] = useState<any[]>([]);
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
    <Tabs defaultValue="journal" className="space-y-6">
      <TabsList>
        <TabsTrigger value="journal">Журнал оценок</TabsTrigger>
        <TabsTrigger value="grades">Выставить оценку</TabsTrigger>
        <TabsTrigger value="homework">Домашние задания</TabsTrigger>
        <TabsTrigger value="create-homework">Создать задание</TabsTrigger>
      </TabsList>

      <TabsContent value="journal">
        <GradeJournal user={user} subjects={subjects} toast={toast} />
      </TabsContent>

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
};

export default TeacherPanel;