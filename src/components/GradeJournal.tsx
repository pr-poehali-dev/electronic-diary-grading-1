import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/bfbeda34-cef5-4bdd-946d-7a5dcae64e26';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  fullName: string;
  className?: string;
}

interface Subject {
  id: number;
  name: string;
}

interface GradeJournalProps {
  user: User;
  subjects: Subject[];
  toast: any;
}

interface Student {
  id: number;
  full_name: string;
  class_name: string;
}

interface JournalEntry {
  date: string;
  grade?: number;
  mark_type: 'grade' | 'absent' | 'excused' | 'sick' | 'not_attested';
  comment?: string;
}

const GradeJournal = ({ user, subjects, toast }: GradeJournalProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1_quarter');
  const [students, setStudents] = useState<Student[]>([]);
  const [journalData, setJournalData] = useState<any>({});
  const [dates, setDates] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  
  const [isMarkDialog, setIsMarkDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markType, setMarkType] = useState<string>('grade');
  const [gradeValue, setGradeValue] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedClass) {
      loadJournalData();
    }
  }, [selectedSubject, selectedClass, selectedPeriod]);

  const loadClasses = async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_classes`);
      const data = await response.json();
      if (response.ok) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadJournalData = async () => {
    try {
      const response = await fetch(
        `${API_URL}?action=get_journal&subjectId=${selectedSubject}&className=${selectedClass}&period=${selectedPeriod}`
      );
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students);
        setJournalData(data.journal);
        setDates(data.dates);
      }
    } catch (error) {
      console.error('Error loading journal:', error);
    }
  };

  const openMarkDialog = (studentId: number, date: string) => {
    setSelectedStudent(studentId);
    setSelectedDate(date);
    
    const existing = journalData[studentId]?.[date];
    if (existing) {
      setMarkType(existing.mark_type);
      setGradeValue(existing.grade?.toString() || '');
      setComment(existing.comment || '');
    } else {
      setMarkType('grade');
      setGradeValue('');
      setComment('');
    }
    
    setIsMarkDialog(true);
  };

  const handleSaveMark = async () => {
    if (!selectedStudent || !selectedDate) return;

    if (markType === 'grade' && !gradeValue) {
      toast({ title: 'Ошибка', description: 'Выберите оценку', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=save_mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          subjectId: parseInt(selectedSubject),
          teacherId: user.id,
          date: selectedDate,
          markType: markType,
          grade: markType === 'grade' ? parseInt(gradeValue) : null,
          comment: comment,
          period: selectedPeriod
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Отметка сохранена' });
        setIsMarkDialog(false);
        loadJournalData();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить отметку', variant: 'destructive' });
    }
  };

  const handleSavePeriodGrade = async (studentId: number, finalGrade: string) => {
    if (!finalGrade) return;

    try {
      const response = await fetch(`${API_URL}?action=save_period_grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId,
          subjectId: parseInt(selectedSubject),
          teacherId: user.id,
          period: selectedPeriod,
          finalGrade: parseInt(finalGrade)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Итоговая оценка выставлена' });
        loadJournalData();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить итоговую оценку', variant: 'destructive' });
    }
  };

  const renderMark = (studentId: number, date: string) => {
    const entry = journalData[studentId]?.[date];
    
    if (!entry) {
      return (
        <div className="w-10 h-10 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer flex items-center justify-center"
          onClick={() => openMarkDialog(studentId, date)}
        >
          <span className="text-slate-300">+</span>
        </div>
      );
    }

    let displayValue = '';
    let bgColor = 'bg-slate-100';
    let textColor = 'text-slate-800';

    switch (entry.mark_type) {
      case 'grade':
        displayValue = entry.grade?.toString() || '';
        if (entry.grade === 5) {
          bgColor = 'bg-green-100';
          textColor = 'text-green-800';
        } else if (entry.grade === 4) {
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-800';
        } else if (entry.grade === 3) {
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-800';
        } else if (entry.grade === 2) {
          bgColor = 'bg-red-100';
          textColor = 'text-red-800';
        }
        break;
      case 'absent':
        displayValue = 'Н';
        bgColor = 'bg-red-50';
        textColor = 'text-red-700';
        break;
      case 'excused':
        displayValue = 'П';
        bgColor = 'bg-amber-50';
        textColor = 'text-amber-700';
        break;
      case 'sick':
        displayValue = 'Б';
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-700';
        break;
      case 'not_attested':
        displayValue = 'Н/А';
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
    }

    return (
      <div
        className={`w-10 h-10 ${bgColor} rounded flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-80 ${textColor}`}
        onClick={() => openMarkDialog(studentId, date)}
        title={entry.comment}
      >
        {displayValue}
      </div>
    );
  };

  const renderPeriodGrade = (studentId: number) => {
    const periodGrade = journalData[studentId]?.period_grade;
    
    return (
      <Select
        value={periodGrade?.toString() || ''}
        onValueChange={(value) => handleSavePeriodGrade(studentId, value)}
      >
        <SelectTrigger className="w-16 h-10">
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="2">2</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={24} />
            Журнал оценок
          </CardTitle>
          <CardDescription>Классический журнал как в Дневник.ру</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Предмет</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Класс</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Период</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_quarter">1 четверть</SelectItem>
                  <SelectItem value="2_quarter">2 четверть</SelectItem>
                  <SelectItem value="3_quarter">3 четверть</SelectItem>
                  <SelectItem value="4_quarter">4 четверть</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSubject && selectedClass && students.length > 0 && (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">Ученик</TableHead>
                    {dates.map((date) => (
                      <TableHead key={date} className="text-center min-w-[50px]">
                        {new Date(date).getDate()}.{new Date(date).getMonth() + 1}
                      </TableHead>
                    ))}
                    <TableHead className="text-center bg-blue-50 font-bold min-w-[80px]">Итого</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-white z-10 font-medium">
                        {student.full_name}
                      </TableCell>
                      {dates.map((date) => (
                        <TableCell key={date} className="text-center p-2">
                          {renderMark(student.id, date)}
                        </TableCell>
                      ))}
                      <TableCell className="text-center bg-blue-50 p-2">
                        {renderPeriodGrade(student.id)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedSubject && selectedClass && students.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              В классе {selectedClass} нет учеников
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Обозначения:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 text-green-800 rounded flex items-center justify-center font-bold text-xs">5</div>
                <span>Отлично</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded flex items-center justify-center font-bold text-xs">4</div>
                <span>Хорошо</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded flex items-center justify-center font-bold text-xs">3</div>
                <span>Удовлетворительно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 text-red-800 rounded flex items-center justify-center font-bold text-xs">2</div>
                <span>Неудовлетворительно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-50 text-red-700 rounded flex items-center justify-center font-bold text-xs">Н</div>
                <span>Отсутствие</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-50 text-amber-700 rounded flex items-center justify-center font-bold text-xs">П</div>
                <span>Уважительная причина</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-50 text-blue-700 rounded flex items-center justify-center font-bold text-xs">Б</div>
                <span>Болеет</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 text-red-800 rounded flex items-center justify-center font-bold text-xs">Н/А</div>
                <span>Не аттестован</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isMarkDialog} onOpenChange={setIsMarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выставить отметку</DialogTitle>
            <DialogDescription>
              {selectedDate && `Дата: ${new Date(selectedDate).toLocaleDateString('ru-RU')}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тип отметки</Label>
              <Select value={markType} onValueChange={setMarkType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade">Оценка (2-5)</SelectItem>
                  <SelectItem value="absent">Н - Отсутствие</SelectItem>
                  <SelectItem value="excused">П - Уважительная причина</SelectItem>
                  <SelectItem value="sick">Б - Болеет</SelectItem>
                  <SelectItem value="not_attested">Н/А - Не аттестован</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {markType === 'grade' && (
              <div className="space-y-2">
                <Label>Оценка</Label>
                <Select value={gradeValue} onValueChange={setGradeValue}>
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
            )}

            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Добавьте комментарий к отметке"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveMark} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setIsMarkDialog(false)} className="flex-1">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GradeJournal;
