-- Создание таблиц для электронного дневника

-- Таблица пользователей (администраторы, учителя, ученики)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    class_name VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Таблица предметов
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь учителей с предметами
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES subjects(id),
    UNIQUE(teacher_id, subject_id)
);

-- Таблица оценок
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES users(id),
    grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 5),
    comment TEXT,
    grade_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица домашних заданий
CREATE TABLE IF NOT EXISTS homework (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES users(id),
    class_name VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    deadline DATE NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка администратора по умолчанию
INSERT INTO users (username, password, role, full_name, email)
VALUES ('kostya', 'roblox-top', 'admin', 'Администратор', 'admin@school.ru')
ON CONFLICT (username) DO NOTHING;

-- Вставка предметов по умолчанию
INSERT INTO subjects (name, description) VALUES
('Математика', 'Алгебра и геометрия'),
('Русский язык', 'Русский язык и литература'),
('Физика', 'Физика и астрономия'),
('Химия', 'Общая и неорганическая химия'),
('Биология', 'Общая биология'),
('История', 'История России и всемирная история'),
('Обществознание', 'Обществознание и право'),
('География', 'География'),
('Английский язык', 'Иностранный язык'),
('Информатика', 'Информатика и ИКТ'),
('Физкультура', 'Физическая культура'),
('Музыка', 'Музыка'),
('ИЗО', 'Изобразительное искусство'),
('Технология', 'Технология')
ON CONFLICT DO NOTHING;

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(class_name);
CREATE INDEX IF NOT EXISTS idx_homework_deadline ON homework(deadline);