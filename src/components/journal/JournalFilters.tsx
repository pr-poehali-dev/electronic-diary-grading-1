import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subject {
  id: number;
  name: string;
}

interface JournalFiltersProps {
  subjects: Subject[];
  classes: string[];
  selectedSubject: string;
  selectedClass: string;
  selectedPeriod: string;
  onSubjectChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

const JournalFilters = ({
  subjects,
  classes,
  selectedSubject,
  selectedClass,
  selectedPeriod,
  onSubjectChange,
  onClassChange,
  onPeriodChange
}: JournalFiltersProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="space-y-2">
        <Label>Предмет *</Label>
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
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
        <Select value={selectedClass} onValueChange={onClassChange}>
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
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
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
  );
};

export default JournalFilters;
