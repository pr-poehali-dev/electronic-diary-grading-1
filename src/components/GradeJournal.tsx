import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const handleDeleteMark = async () => {
    if (!selectedStudent || !selectedDate) return;

    try {
      const response = await fetch(`${API_URL}?action=delete_mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          subjectId: parseInt(selectedSubject),
          date: selectedDate
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Отметка удалена' });
        setIsMarkDialog(false);
        loadJournalData();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить отметку', variant: 'destructive' });
    }
  };

  const renderMark = (studentId: number, date: string) => {
    const entry = journalData[studentId]?.[date];
    
    if (!entry) {
      return (
        <div 
          className="w-full h-full hover:bg-blue-50 cursor-pointer flex items-center justify-center transition-colors"
          onClick={() => openMarkDialog(studentId, date)}
        >
          <span className="text-slate-300 text-xs">•</span>
        </div>
      );
    }

    let displayValue = '';
    let bgColor = 'bg-white';
    let textColor = 'text-slate-800';
    let borderColor = 'border-slate-200';

    switch (entry.mark_type) {
      case 'grade':
        displayValue = entry.grade?.toString() || '';
        if (entry.grade === 5) {
          bgColor = 'bg-green-50';
          textColor = 'text-green-700';
          borderColor = 'border-green-200';
        } else if (entry.grade === 4) {
          bgColor = 'bg-blue-50';
          textColor = 'text-blue-700';
          borderColor = 'border-blue-200';
        } else if (entry.grade === 3) {
          bgColor = 'bg-yellow-50';
          textColor = 'text-yellow-700';
          borderColor = 'border-yellow-200';
        } else if (entry.grade === 2) {
          bgColor = 'bg-red-50';
          textColor = 'text-red-700';
          borderColor = 'border-red-200';
        }
        break;
      case 'absent':
        displayValue = 'Н';
        bgColor = 'bg-red-50';
        textColor = 'text-red-600';
        borderColor = 'border-red-200';
        break;
      case 'excused':
        displayValue = 'П';
        bgColor = 'bg-orange-50';
        textColor = 'text-orange-600';
        borderColor = 'border-orange-200';
        break;
      case 'sick':
        displayValue = 'Б';
        bgColor = 'bg-sky-50';
        textColor = 'text-sky-600';
        borderColor = 'border-sky-200';
        break;
      case 'not_attested':
        displayValue = 'Н/А';
        bgColor = 'bg-red-50';
        textColor = 'text-red-700';
        borderColor = 'border-red-300';
        break;
    }

    return (
      <div
        className={`w-full h-full ${bgColor} flex items-center justify-center font-semibold text-sm cursor-pointer hover:opacity-75 transition-opacity ${textColor} border-r ${borderColor}`}
        onClick={() => openMarkDialog(studentId, date)}
        title={entry.comment || 'Нажмите для редактирования'}
      >
        {displayValue}
      </div>
    );
  };

  const renderPeriodGrade = (studentId: number) => {
    const periodGrade = journalData[studentId]?.period_grade;
    
    let bgColor = 'bg-white';
    let textColor = 'text-slate-700';
    
    if (periodGrade === 5) {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    } else if (periodGrade === 4) {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
    } else if (periodGrade === 3) {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
    } else if (periodGrade === 2) {
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    }

    return (
      <Select
        value={periodGrade?.toString() || ''}
        onValueChange={(value) => handleSavePeriodGrade(studentId, value)}
      >
        <SelectTrigger className={`h-full border-0 ${bgColor} ${textColor} font-bold text-center`}>
          <SelectValue placeholder="—" />
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
            <Icon name="BookText" size={24} />
            Журнал оценок
          </CardTitle>
          <CardDescription>Электронный журнал успеваемости</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Предмет *</Label>
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
              <Label>Класс *</Label>
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
              <Label>Период *</Label>
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
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="border-b bg-slate-50">
                    <div className="flex">
                      <div className="w-64 px-4 py-3 font-semibold text-sm text-slate-700 border-r bg-slate-100 sticky left-0 z-20">
                        Фамилия Имя
                      </div>
                      <div className="flex">
                        {dates.map((date) => (
                          <div 
                            key={date} 
                            className="w-14 px-2 py-3 text-center font-medium text-xs text-slate-600 border-r"
                          >
                            <div>{new Date(date).getDate()}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(date).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="w-20 px-2 py-3 text-center font-semibold text-sm text-slate-700 bg-blue-50 border-l-2 border-blue-200">
                        Итог
                      </div>
                    </div>
                  </div>

                  <div>
                    {students.map((student, idx) => (
                      <div 
                        key={student.id} 
                        className={`flex border-b hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                      >
                        <div className="w-64 px-4 py-3 font-medium text-sm text-slate-800 border-r bg-white sticky left-0 z-10">
                          {student.full_name}
                        </div>
                        <div className="flex">
                          {dates.map((date) => (
                            <div 
                              key={`${student.id}-${date}`} 
                              className="w-14 h-12 border-r"
                            >
                              {renderMark(student.id, date)}
                            </div>
                          ))}
                        </div>
                        <div className="w-20 h-12 bg-blue-50/50 border-l-2 border-blue-200">
                          {renderPeriodGrade(student.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSubject && selectedClass && students.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
              <Icon name="Users" size={48} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">В классе {selectedClass} нет учеников</p>
            </div>
          )}

          {(!selectedSubject || !selectedClass) && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
              <Icon name="BookOpen" size={48} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">Выберите предмет и класс для работы с журналом</p>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-lg border">
            <p className="text-sm font-semibold mb-3 text-slate-700">Условные обозначения:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 text-green-700 border border-green-200 rounded flex items-center justify-center font-bold">5</div>
                <span className="text-slate-600">Отлично</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 text-blue-700 border border-blue-200 rounded flex items-center justify-center font-bold">4</div>
                <span className="text-slate-600">Хорошо</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded flex items-center justify-center font-bold">3</div>
                <span className="text-slate-600">Удовлетворительно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 text-red-700 border border-red-200 rounded flex items-center justify-center font-bold">2</div>
                <span className="text-slate-600">Неудовлетворительно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 text-red-600 border border-red-200 rounded flex items-center justify-center font-semibold text-xs">Н</div>
                <span className="text-slate-600">Отсутствовал</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-50 text-orange-600 border border-orange-200 rounded flex items-center justify-center font-semibold text-xs">П</div>
                <span className="text-slate-600">Уважительная причина</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-50 text-sky-600 border border-sky-200 rounded flex items-center justify-center font-semibold text-xs">Б</div>
                <span className="text-slate-600">Болел</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 text-red-700 border border-red-300 rounded flex items-center justify-center font-semibold text-[10px]">Н/А</div>
                <span className="text-slate-600">Не аттестован</span>
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
              {selectedStudent && selectedDate && (
                <>
                  <span className="font-medium">
                    {students.find(s => s.id === selectedStudent)?.full_name}
                  </span>
                  {' • '}
                  {new Date(selectedDate).toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </>
              )}
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
                  <SelectItem value="grade">📝 Оценка (2-5)</SelectItem>
                  <SelectItem value="absent">❌ Н - Отсутствовал</SelectItem>
                  <SelectItem value="excused">📋 П - Уважительная причина</SelectItem>
                  <SelectItem value="sick">🤒 Б - Болел</SelectItem>
                  <SelectItem value="not_attested">⛔ Н/А - Не аттестован</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {markType === 'grade' && (
              <div className="space-y-2">
                <Label>Оценка *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 4, 3, 2].map((grade) => (
                    <Button
                      key={grade}
                      type="button"
                      variant={gradeValue === grade.toString() ? 'default' : 'outline'}
                      className={`h-16 text-2xl font-bold ${
                        grade === 5 ? 'hover:bg-green-100' : 
                        grade === 4 ? 'hover:bg-blue-100' : 
                        grade === 3 ? 'hover:bg-yellow-100' : 
                        'hover:bg-red-100'
                      }`}
                      onClick={() => setGradeValue(grade.toString())}
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Добавьте комментарий к отметке (необязательно)"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveMark} className="flex-1">
                <Icon name="Check" size={16} className="mr-2" />
                Сохранить
              </Button>
              {journalData[selectedStudent!]?.[selectedDate] && (
                <Button onClick={handleDeleteMark} variant="destructive">
                  <Icon name="Trash2" size={16} />
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsMarkDialog(false)}>
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
