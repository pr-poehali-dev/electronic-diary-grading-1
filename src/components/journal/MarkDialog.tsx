import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Student {
  id: number;
  full_name: string;
  class_name: string;
}

interface MarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedStudent: number | null;
  selectedDate: string;
  markType: string;
  gradeValue: string;
  comment: string;
  journalData: any;
  onMarkTypeChange: (value: string) => void;
  onGradeValueChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
}

const MarkDialog = ({
  isOpen,
  onClose,
  students,
  selectedStudent,
  selectedDate,
  markType,
  gradeValue,
  comment,
  journalData,
  onMarkTypeChange,
  onGradeValueChange,
  onCommentChange,
  onSave,
  onDelete
}: MarkDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <Select value={markType} onValueChange={onMarkTypeChange}>
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
                    onClick={() => onGradeValueChange(grade.toString())}
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
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Добавьте комментарий к отметке (необязательно)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onSave} className="flex-1">
              <Icon name="Check" size={16} className="mr-2" />
              Сохранить
            </Button>
            {journalData[selectedStudent!]?.[selectedDate] && (
              <Button onClick={onDelete} variant="destructive">
                <Icon name="Trash2" size={16} />
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarkDialog;
