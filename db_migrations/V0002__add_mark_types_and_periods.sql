-- Добавляем поддержку различных типов отметок
ALTER TABLE grades ADD COLUMN IF NOT EXISTS mark_type VARCHAR(10) DEFAULT 'grade';
ALTER TABLE grades ADD COLUMN IF NOT EXISTS period VARCHAR(20);

-- Создаем таблицу для итоговых оценок
CREATE TABLE IF NOT EXISTS period_grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id),
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    period VARCHAR(20) NOT NULL,
    final_grade INTEGER CHECK (final_grade >= 2 AND final_grade <= 5),
    teacher_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, period)
);

CREATE INDEX IF NOT EXISTS idx_period_grades_student ON period_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_period_grades_subject ON period_grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_period_grades_period ON period_grades(period);
