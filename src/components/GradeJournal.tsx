import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import JournalFilters from './journal/JournalFilters';
import JournalTable from './journal/JournalTable';
import MarkDialog from './journal/MarkDialog';
import JournalLegend from './journal/JournalLegend';

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

  const handleMarkSave = async (studentId: number, date: string, value: string) => {
    try {
      const response = await fetch(`${API_URL}?action=save_mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId,
          subjectId: parseInt(selectedSubject),
          teacherId: user.id,
          date: date,
          markValue: value,
          period: selectedPeriod
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно', description: 'Отметка сохранена' });
        loadJournalData();
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось сохранить отметку', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить отметку', variant: 'destructive' });
    }
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
          <JournalFilters
            subjects={subjects}
            classes={classes}
            selectedSubject={selectedSubject}
            selectedClass={selectedClass}
            selectedPeriod={selectedPeriod}
            onSubjectChange={setSelectedSubject}
            onClassChange={setSelectedClass}
            onPeriodChange={setSelectedPeriod}
          />

          <JournalTable
            students={students}
            dates={dates}
            journalData={journalData}
            selectedSubject={selectedSubject}
            selectedClass={selectedClass}
            onMarkClick={openMarkDialog}
            onPeriodGradeChange={handleSavePeriodGrade}
            onMarkSave={handleMarkSave}
          />

          <JournalLegend />
        </CardContent>
      </Card>

      <MarkDialog
        isOpen={isMarkDialog}
        onClose={() => setIsMarkDialog(false)}
        students={students}
        selectedStudent={selectedStudent}
        selectedDate={selectedDate}
        markType={markType}
        gradeValue={gradeValue}
        comment={comment}
        journalData={journalData}
        onMarkTypeChange={setMarkType}
        onGradeValueChange={setGradeValue}
        onCommentChange={setComment}
        onSave={handleSaveMark}
        onDelete={handleDeleteMark}
      />
    </>
  );
};

export default GradeJournal;