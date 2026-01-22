import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  fullName: string;
  email?: string;
  phone?: string;
  className?: string;
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

interface StudentPanelProps {
  user: User;
  grades: Grade[];
  homework: Homework[];
  stats: Stats | null;
  getGradeColor: (grade: number) => string;
}

const StudentPanel = ({ user, grades, homework, stats, getGradeColor }: StudentPanelProps) => {
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
};

export default StudentPanel;
