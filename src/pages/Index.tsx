import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');

  const studentData = {
    name: 'Иванов Алексей',
    class: '9-А',
    avatar: '',
    grades: [
      { subject: 'Математика', grade: 5, date: '2026-01-20', teacher: 'Смирнова О.И.', comment: 'Отличная контрольная работа! Все задачи решены верно.' },
      { subject: 'Русский язык', grade: 4, date: '2026-01-19', teacher: 'Петрова А.В.', comment: 'Хорошее сочинение, но есть несколько пунктуационных ошибок.' },
      { subject: 'Физика', grade: 5, date: '2026-01-18', teacher: 'Козлов В.С.', comment: 'Превосходная лабораторная работа.' },
      { subject: 'История', grade: 4, date: '2026-01-17', teacher: 'Федорова Н.М.', comment: 'Хорошо знает материал, но нужно больше деталей.' },
      { subject: 'Английский язык', grade: 5, date: '2026-01-16', teacher: 'Беляева Е.Д.', comment: 'Отличное владение грамматикой и лексикой.' },
    ],
    homework: [
      { subject: 'Математика', task: 'Учебник стр. 45, №12-18', deadline: '2026-01-22', teacher: 'Смирнова О.И.', comment: 'Решить все задачи с подробным объяснением.' },
      { subject: 'Русский язык', task: 'Написать эссе на тему "Роль литературы"', deadline: '2026-01-23', teacher: 'Петрова А.В.', comment: 'Объем 250-300 слов. Использовать примеры из классической литературы.' },
      { subject: 'Физика', task: 'Подготовить доклад о законах Ньютона', deadline: '2026-01-25', teacher: 'Козлов В.С.', comment: 'Приветствуются практические примеры.' },
    ],
    teachers: [
      { name: 'Смирнова Ольга Ивановна', subject: 'Математика', email: 'smirnova@school.ru', phone: '+7 (999) 123-45-67' },
      { name: 'Петрова Анна Владимировна', subject: 'Русский язык', email: 'petrova@school.ru', phone: '+7 (999) 234-56-78' },
      { name: 'Козлов Виктор Сергеевич', subject: 'Физика', email: 'kozlov@school.ru', phone: '+7 (999) 345-67-89' },
      { name: 'Федорова Наталья Михайловна', subject: 'История', email: 'fedorova@school.ru', phone: '+7 (999) 456-78-90' },
      { name: 'Беляева Елена Дмитриевна', subject: 'Английский язык', email: 'belyaeva@school.ru', phone: '+7 (999) 567-89-01' },
    ],
  };

  const getGradeColor = (grade: number) => {
    if (grade === 5) return 'bg-green-100 text-green-800 border-green-300';
    if (grade === 4) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getAverageGrade = () => {
    const sum = studentData.grades.reduce((acc, item) => acc + item.grade, 0);
    return (sum / studentData.grades.length).toFixed(2);
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
            <CardDescription>Войдите в систему для доступа к оценкам</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ivanov@school.ru" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => { setIsLoggedIn(true); setUserRole('student'); }}
              >
                <Icon name="User" size={16} className="mr-2" />
                Вход для ученика
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => { setIsLoggedIn(true); setUserRole('teacher'); }}
              >
                <Icon name="UserCheck" size={16} className="mr-2" />
                Вход для учителя
              </Button>
            </div>
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
              <p className="font-semibold text-slate-900">{studentData.name}</p>
              <p className="text-sm text-slate-500">Класс {studentData.class}</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-primary text-white">ИА</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => setIsLoggedIn(false)}>
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="home" className="gap-2">
              <Icon name="Home" size={16} />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <Icon name="Award" size={16} />
              <span className="hidden sm:inline">Оценки</span>
            </TabsTrigger>
            <TabsTrigger value="homework" className="gap-2">
              <Icon name="BookOpen" size={16} />
              <span className="hidden sm:inline">Домашнее задание</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="gap-2">
              <Icon name="Users" size={16} />
              <span className="hidden sm:inline">Учителя</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Icon name="User" size={16} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Средний балл</CardTitle>
                  <Icon name="TrendingUp" size={20} className="text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{getAverageGrade()}</div>
                  <p className="text-xs text-slate-500 mt-1">За текущий период</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Оценок</CardTitle>
                  <Icon name="Award" size={20} className="text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{studentData.grades.length}</div>
                  <p className="text-xs text-slate-500 mt-1">За последнюю неделю</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Домашних заданий</CardTitle>
                  <Icon name="BookOpen" size={20} className="text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{studentData.homework.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Активных заданий</p>
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
                  {studentData.grades.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item.subject}</p>
                        <p className="text-sm text-slate-500">{item.date}</p>
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
                  {studentData.homework.map((item, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-slate-900">{item.subject}</p>
                        <Badge variant="outline" className="text-xs">
                          <Icon name="Clock" size={12} className="mr-1" />
                          {item.deadline}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{item.task}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Award" size={24} />
                  Журнал оценок
                </CardTitle>
                <CardDescription>Все ваши оценки с комментариями учителей</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.grades.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-900">{item.subject}</h3>
                          <p className="text-sm text-slate-500">
                            <Icon name="User" size={14} className="inline mr-1" />
                            {item.teacher}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getGradeColor(item.grade)} border font-bold text-xl px-4 py-2`}>
                            {item.grade}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                          <Icon name="MessageCircle" size={16} />
                          Комментарий учителя:
                        </p>
                        <p className="text-sm text-blue-800">{item.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" size={24} />
                  Домашние задания
                </CardTitle>
                <CardDescription>Актуальные задания с указаниями учителей</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.homework.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-900">{item.subject}</h3>
                          <p className="text-sm text-slate-500">
                            <Icon name="User" size={14} className="inline mr-1" />
                            {item.teacher}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          Срок: {item.deadline}
                        </Badge>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg mb-3">
                        <p className="font-semibold text-slate-900 mb-1">Задание:</p>
                        <p className="text-slate-700">{item.task}</p>
                      </div>
                      <Separator className="my-3" />
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                          <Icon name="Info" size={16} />
                          Указания учителя:
                        </p>
                        <p className="text-sm text-amber-800">{item.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={24} />
                  Контакты учителей
                </CardTitle>
                <CardDescription>Информация для связи с преподавателями</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {studentData.teachers.map((teacher, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-white">
                              {teacher.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-base">{teacher.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">{teacher.subject}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Icon name="Mail" size={16} className="text-slate-400" />
                          <a href={`mailto:${teacher.email}`} className="hover:text-primary">
                            {teacher.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Icon name="Phone" size={16} className="text-slate-400" />
                          <a href={`tel:${teacher.phone}`} className="hover:text-primary">
                            {teacher.phone}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={24} />
                  Профиль ученика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary text-white text-3xl">ИА</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-slate-500">ФИО</Label>
                      <p className="text-lg font-semibold text-slate-900">{studentData.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Класс</Label>
                      <p className="text-lg font-semibold text-slate-900">{studentData.class}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Средний балл</Label>
                      <p className="text-lg font-semibold text-slate-900">{getAverageGrade()}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Статистика</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 mb-1">Отличных оценок</p>
                      <p className="text-2xl font-bold text-green-700">
                        {studentData.grades.filter(g => g.grade === 5).length}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 mb-1">Хороших оценок</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {studentData.grades.filter(g => g.grade === 4).length}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-600 mb-1">Активных заданий</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {studentData.homework.length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
