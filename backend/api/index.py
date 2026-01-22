import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для работы с пользователями, оценками и домашними заданиями"""
    
    method = event.get('httpMethod', 'GET')
    path = event.get('queryStringParameters', {}).get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return error_response('Database not configured', 500)
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if path == 'get_users':
            return get_users(cursor, event)
        elif path == 'create_user':
            return create_user(cursor, conn, event)
        elif path == 'get_subjects':
            return get_subjects(cursor)
        elif path == 'get_grades':
            return get_grades(cursor, event)
        elif path == 'create_grade':
            return create_grade(cursor, conn, event)
        elif path == 'get_homework':
            return get_homework(cursor, event)
        elif path == 'create_homework':
            return create_homework(cursor, conn, event)
        elif path == 'get_teacher_subjects':
            return get_teacher_subjects(cursor, event)
        elif path == 'assign_teacher_subject':
            return assign_teacher_subject(cursor, conn, event)
        elif path == 'get_stats':
            return get_stats(cursor, event)
        elif path == 'get_all_grades':
            return get_all_grades(cursor)
        elif path == 'get_classes':
            return get_classes(cursor)
        elif path == 'get_journal':
            return get_journal(cursor, event)
        elif path == 'save_mark':
            return save_mark(cursor, conn, event)
        elif path == 'save_period_grade':
            return save_period_grade(cursor, conn, event)
        elif path == 'delete_mark':
            return delete_mark(cursor, conn, event)
        elif path == 'delete_user':
            return delete_user(cursor, conn, event)
        else:
            return error_response('Unknown action', 400)
            
    except Exception as e:
        return error_response(f'Server error: {str(e)}', 500)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def error_response(message: str, status: int = 400):
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }

def success_response(data: dict):
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(data),
        'isBase64Encoded': False
    }

def get_users(cursor, event):
    params = event.get('queryStringParameters', {})
    role = params.get('role', '')
    
    if role:
        cursor.execute("SELECT id, username, role, full_name, email, phone, class_name, created_at FROM users WHERE role = %s ORDER BY full_name", (role,))
    else:
        cursor.execute("SELECT id, username, role, full_name, email, phone, class_name, created_at FROM users ORDER BY role, full_name")
    
    users = cursor.fetchall()
    return success_response({'users': [dict(u) for u in users]})

def create_user(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    username = body.get('username', '').strip()
    password = body.get('password', '').strip()
    role = body.get('role', '').strip()
    full_name = body.get('fullName', '').strip()
    email = body.get('email', '').strip()
    phone = body.get('phone', '').strip()
    class_name = body.get('className', '').strip()
    created_by = body.get('createdBy')
    
    if not all([username, password, role, full_name]):
        return error_response('Заполните все обязательные поля')
    
    if role not in ['admin', 'teacher', 'student']:
        return error_response('Неверная роль пользователя')
    
    try:
        cursor.execute(
            "INSERT INTO users (username, password, role, full_name, email, phone, class_name, created_by) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (username, password, role, full_name, email, phone, class_name, created_by)
        )
        user_id = cursor.fetchone()['id']
        conn.commit()
        
        return success_response({'success': True, 'userId': user_id})
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return error_response('Пользователь с таким логином уже существует')

def get_subjects(cursor):
    cursor.execute("SELECT id, name, description FROM subjects ORDER BY name")
    subjects = cursor.fetchall()
    return success_response({'subjects': [dict(s) for s in subjects]})

def get_grades(cursor, event):
    params = event.get('queryStringParameters', {})
    student_id = params.get('studentId')
    class_name = params.get('className')
    
    if student_id:
        cursor.execute("""
            SELECT g.id, g.grade, g.mark_type, g.comment, g.grade_date, g.period,
                   s.name as subject_name,
                   u.full_name as teacher_name
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            JOIN users u ON g.teacher_id = u.id
            WHERE g.student_id = %s AND g.mark_type = 'grade'
            ORDER BY g.grade_date DESC
        """, (student_id,))
    elif class_name:
        cursor.execute("""
            SELECT g.id, g.grade, g.mark_type, g.comment, g.grade_date, g.period,
                   s.name as subject_name,
                   st.full_name as student_name,
                   st.id as student_id
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            JOIN users st ON g.student_id = st.id
            WHERE st.class_name = %s AND g.mark_type = 'grade'
            ORDER BY g.grade_date DESC
        """, (class_name,))
    else:
        return error_response('Требуется studentId или className')
    
    grades = cursor.fetchall()
    return success_response({'grades': [dict(g) for g in grades]})

def create_grade(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    student_id = body.get('studentId')
    subject_id = body.get('subjectId')
    teacher_id = body.get('teacherId')
    grade = body.get('grade')
    comment = body.get('comment', '').strip()
    grade_date = body.get('gradeDate', datetime.now().strftime('%Y-%m-%d'))
    
    if not all([student_id, subject_id, teacher_id, grade]):
        return error_response('Заполните все обязательные поля')
    
    if grade not in [1, 2, 3, 4, 5]:
        return error_response('Оценка должна быть от 1 до 5')
    
    cursor.execute(
        "INSERT INTO grades (student_id, subject_id, teacher_id, grade, comment, grade_date) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
        (student_id, subject_id, teacher_id, grade, comment, grade_date)
    )
    grade_id = cursor.fetchone()['id']
    conn.commit()
    
    return success_response({'success': True, 'gradeId': grade_id})

def get_homework(cursor, event):
    params = event.get('queryStringParameters', {})
    class_name = params.get('className')
    teacher_id = params.get('teacherId')
    
    if class_name:
        cursor.execute("""
            SELECT h.id, h.title, h.description, h.deadline, h.comment,
                   s.name as subject_name,
                   u.full_name as teacher_name
            FROM homework h
            JOIN subjects s ON h.subject_id = s.id
            JOIN users u ON h.teacher_id = u.id
            WHERE h.class_name = %s
            ORDER BY h.deadline DESC
        """, (class_name,))
    elif teacher_id:
        cursor.execute("""
            SELECT h.id, h.title, h.description, h.deadline, h.comment, h.class_name,
                   s.name as subject_name
            FROM homework h
            JOIN subjects s ON h.subject_id = s.id
            WHERE h.teacher_id = %s
            ORDER BY h.deadline DESC
        """, (teacher_id,))
    else:
        cursor.execute("""
            SELECT h.id, h.title, h.description, h.deadline, h.comment, h.class_name,
                   s.name as subject_name,
                   u.full_name as teacher_name
            FROM homework h
            JOIN subjects s ON h.subject_id = s.id
            JOIN users u ON h.teacher_id = u.id
            ORDER BY h.deadline DESC
            LIMIT 50
        """)
    
    homework = cursor.fetchall()
    return success_response({'homework': [dict(h) for h in homework]})

def create_homework(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    subject_id = body.get('subjectId')
    teacher_id = body.get('teacherId')
    class_name = body.get('className', '').strip()
    title = body.get('title', '').strip()
    description = body.get('description', '').strip()
    deadline = body.get('deadline')
    comment = body.get('comment', '').strip()
    
    if not all([subject_id, teacher_id, class_name, title, description, deadline]):
        return error_response('Заполните все обязательные поля')
    
    cursor.execute(
        "INSERT INTO homework (subject_id, teacher_id, class_name, title, description, deadline, comment) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (subject_id, teacher_id, class_name, title, description, deadline, comment)
    )
    homework_id = cursor.fetchone()['id']
    conn.commit()
    
    return success_response({'success': True, 'homeworkId': homework_id})

def get_teacher_subjects(cursor, event):
    params = event.get('queryStringParameters', {})
    teacher_id = params.get('teacherId')
    
    if not teacher_id:
        return error_response('Требуется teacherId')
    
    cursor.execute("""
        SELECT s.id, s.name, s.description
        FROM subjects s
        JOIN teacher_subjects ts ON s.id = ts.subject_id
        WHERE ts.teacher_id = %s
        ORDER BY s.name
    """, (teacher_id,))
    
    subjects = cursor.fetchall()
    return success_response({'subjects': [dict(s) for s in subjects]})

def assign_teacher_subject(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    teacher_id = body.get('teacherId')
    subject_id = body.get('subjectId')
    
    if not all([teacher_id, subject_id]):
        return error_response('Требуется teacherId и subjectId')
    
    try:
        cursor.execute(
            "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (%s, %s)",
            (teacher_id, subject_id)
        )
        conn.commit()
        return success_response({'success': True})
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return error_response('Этот предмет уже назначен учителю')

def get_stats(cursor, event):
    params = event.get('queryStringParameters', {})
    student_id = params.get('studentId')
    
    if not student_id:
        return error_response('Требуется studentId')
    
    cursor.execute("SELECT COUNT(*) as total FROM grades WHERE student_id = %s", (student_id,))
    total = cursor.fetchone()['total']
    
    cursor.execute("SELECT COUNT(*) as count FROM grades WHERE student_id = %s AND grade = 5", (student_id,))
    excellent = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM grades WHERE student_id = %s AND grade = 4", (student_id,))
    good = cursor.fetchone()['count']
    
    cursor.execute("SELECT AVG(grade) as avg FROM grades WHERE student_id = %s", (student_id,))
    avg_result = cursor.fetchone()['avg']
    average = float(avg_result) if avg_result else 0.0
    
    return success_response({
        'total': total,
        'excellent': excellent,
        'good': good,
        'average': round(average, 2)
    })

def get_all_grades(cursor):
    cursor.execute("""
        SELECT g.id, g.grade, g.comment, g.grade_date,
               s.name as subject_name,
               st.full_name as student_name,
               t.full_name as teacher_name
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        JOIN users st ON g.student_id = st.id
        JOIN users t ON g.teacher_id = t.id
        ORDER BY g.grade_date DESC
    """)
    
    grades = cursor.fetchall()
    return success_response({'grades': [dict(g) for g in grades]})

def get_classes(cursor):
    cursor.execute("SELECT DISTINCT class_name FROM users WHERE class_name IS NOT NULL AND class_name != '' ORDER BY class_name")
    classes = [row['class_name'] for row in cursor.fetchall()]
    return success_response({'classes': classes})

def get_journal(cursor, event):
    from datetime import datetime, timedelta
    
    params = event.get('queryStringParameters', {})
    subject_id = params.get('subjectId')
    class_name = params.get('className')
    period = params.get('period', '1_quarter')
    
    if not subject_id or not class_name:
        return error_response('Требуется subjectId и className')
    
    cursor.execute("""
        SELECT id, full_name, class_name 
        FROM users 
        WHERE role = 'student' AND class_name = %s
        ORDER BY full_name
    """, (class_name,))
    students = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute("""
        SELECT student_id, grade_date, grade, mark_type, comment
        FROM grades
        WHERE subject_id = %s 
        AND student_id IN (SELECT id FROM users WHERE class_name = %s)
        AND period = %s
        ORDER BY grade_date
    """, (subject_id, class_name, period))
    
    grades_list = cursor.fetchall()
    
    cursor.execute("""
        SELECT student_id, final_grade
        FROM period_grades
        WHERE subject_id = %s 
        AND student_id IN (SELECT id FROM users WHERE class_name = %s)
        AND period = %s
    """, (subject_id, class_name, period))
    
    period_grades = {row['student_id']: row['final_grade'] for row in cursor.fetchall()}
    
    period_dates = {
        '1_quarter': ('2026-09-01', '2026-10-31'),
        '2_quarter': ('2026-11-01', '2026-12-31'),
        '3_quarter': ('2027-01-09', '2027-03-25'),
        '4_quarter': ('2027-03-26', '2027-05-31'),
        'year': ('2026-09-01', '2027-05-31')
    }
    
    start_str, end_str = period_dates.get(period, ('2026-09-01', '2026-10-31'))
    start_date = datetime.strptime(start_str, '%Y-%m-%d')
    end_date = datetime.strptime(end_str, '%Y-%m-%d')
    
    dates = []
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:
            dates.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)
    
    journal = {}
    for student in students:
        journal[student['id']] = {}
        for grade in grades_list:
            if grade['student_id'] == student['id']:
                date_str = str(grade['grade_date'])
                journal[student['id']][date_str] = {
                    'grade': grade['grade'],
                    'mark_type': grade['mark_type'],
                    'comment': grade['comment']
                }
        
        if student['id'] in period_grades:
            journal[student['id']]['period_grade'] = period_grades[student['id']]
    
    return success_response({
        'students': students,
        'journal': journal,
        'dates': dates
    })

def save_mark(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    student_id = body.get('studentId')
    subject_id = body.get('subjectId')
    teacher_id = body.get('teacherId')
    date = body.get('date')
    mark_value = body.get('markValue', '').strip().upper()
    period = body.get('period', '1_quarter')
    
    if not all([student_id, subject_id, teacher_id, date, mark_value]):
        return error_response('Заполните все обязательные поля')
    
    mark_type = 'grade'
    grade = None
    
    if mark_value in ['2', '3', '4', '5']:
        mark_type = 'grade'
        grade = int(mark_value)
    elif mark_value in ['Н', 'N']:
        mark_type = 'absent'
    elif mark_value in ['П', 'P']:
        mark_type = 'excused'
    elif mark_value in ['Б', 'B']:
        mark_type = 'sick'
    elif mark_value in ['Н/А', 'H/A', 'N/A']:
        mark_type = 'not_attested'
    else:
        return error_response('Неверное значение отметки. Используйте: 2-5, Н, П, Б, Н/А')
    
    cursor.execute("""
        SELECT id FROM grades 
        WHERE student_id = %s AND subject_id = %s AND grade_date = %s
    """, (student_id, subject_id, date))
    
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("""
            UPDATE grades 
            SET grade = %s, mark_type = %s, teacher_id = %s, period = %s
            WHERE id = %s
        """, (grade, mark_type, teacher_id, period, existing['id']))
    else:
        cursor.execute("""
            INSERT INTO grades (student_id, subject_id, teacher_id, grade, mark_type, grade_date, period)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (student_id, subject_id, teacher_id, grade, mark_type, date, period))
    
    conn.commit()
    return success_response({'success': True})

def save_period_grade(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    student_id = body.get('studentId')
    subject_id = body.get('subjectId')
    teacher_id = body.get('teacherId')
    period = body.get('period')
    final_grade = body.get('finalGrade')
    
    if not all([student_id, subject_id, teacher_id, period, final_grade]):
        return error_response('Заполните все обязательные поля')
    
    cursor.execute("""
        SELECT id FROM period_grades 
        WHERE student_id = %s AND subject_id = %s AND period = %s
    """, (student_id, subject_id, period))
    
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("""
            UPDATE period_grades 
            SET final_grade = %s, teacher_id = %s
            WHERE id = %s
        """, (final_grade, teacher_id, existing['id']))
    else:
        cursor.execute("""
            INSERT INTO period_grades (student_id, subject_id, teacher_id, period, final_grade)
            VALUES (%s, %s, %s, %s, %s)
        """, (student_id, subject_id, teacher_id, period, final_grade))
    
    conn.commit()
    return success_response({'success': True})

def delete_mark(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    student_id = body.get('studentId')
    subject_id = body.get('subjectId')
    date = body.get('date')
    
    if not all([student_id, subject_id, date]):
        return error_response('Требуется studentId, subjectId и date')
    
    cursor.execute("""
        DELETE FROM grades 
        WHERE student_id = %s AND subject_id = %s AND grade_date = %s
    """, (student_id, subject_id, date))
    
    conn.commit()
    return success_response({'success': True})

def delete_user(cursor, conn, event):
    body = json.loads(event.get('body', '{}'))
    
    user_id = body.get('userId')
    
    if not user_id:
        return error_response('Требуется userId')
    
    cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        return error_response('Пользователь не найден')
    
    if user['role'] == 'admin':
        return error_response('Нельзя удалить администратора')
    
    cursor.execute("DELETE FROM grades WHERE student_id = %s OR teacher_id = %s", (user_id, user_id))
    cursor.execute("DELETE FROM homework WHERE teacher_id = %s", (user_id,))
    cursor.execute("DELETE FROM period_grades WHERE student_id = %s OR teacher_id = %s", (user_id, user_id))
    cursor.execute("DELETE FROM teacher_subjects WHERE teacher_id = %s", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    
    conn.commit()
    return success_response({'success': True})