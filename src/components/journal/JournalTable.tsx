import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Student {
  id: number;
  full_name: string;
  class_name: string;
}

interface JournalTableProps {
  students: Student[];
  dates: string[];
  journalData: any;
  selectedSubject: string;
  selectedClass: string;
  onMarkClick: (studentId: number, date: string) => void;
  onPeriodGradeChange: (studentId: number, grade: string) => void;
}

const JournalTable = ({
  students,
  dates,
  journalData,
  selectedSubject,
  selectedClass,
  onMarkClick,
  onPeriodGradeChange
}: JournalTableProps) => {
  const renderMark = (studentId: number, date: string) => {
    const entry = journalData[studentId]?.[date];
    
    if (!entry) {
      return (
        <div 
          className="w-full h-full hover:bg-blue-50 cursor-pointer flex items-center justify-center transition-colors"
          onClick={() => onMarkClick(studentId, date)}
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
        onClick={() => onMarkClick(studentId, date)}
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
        onValueChange={(value) => onPeriodGradeChange(studentId, value)}
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

  if (!selectedSubject || !selectedClass) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
        <Icon name="BookOpen" size={48} className="mx-auto mb-2 opacity-30" />
        <p className="font-medium">Выберите предмет и класс для работы с журналом</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
        <Icon name="Users" size={48} className="mx-auto mb-2 opacity-30" />
        <p className="font-medium">В классе {selectedClass} нет учеников</p>
      </div>
    );
  }

  return (
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
  );
};

export default JournalTable;
