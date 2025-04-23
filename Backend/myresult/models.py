from django.db import models
from django.core.exceptions import ValidationError

class Session(models.Model):
    name = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name
    

class Term(models.Model):
    name = models.CharField(max_length=20)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="terms")

    def __str__(self):
        return f"{self.name} ({self.session.name})"
    

class Class(models.Model):
    name = models.CharField(max_length=10)
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name="classes")
        
    def __str__(self):
        return f"{self.name} ({self.term.name})"
    

class Subject(models.Model):
    name = models.CharField(max_length=100)
    class_group = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="subjects")

    class Meta:
        unique_together = ('name', 'class_group')

    def __str__(self):
        return f"{self.name} - {self.class_group}"
    

def student_picture_path(instance, filename):
    # Generate file path: students/student_id/filename
    return f'students/{instance.email}/{filename}'

class Student(models.Model):
    lastname = models.CharField(max_length=50)
    firstname = models.CharField(max_length=50)
    othername = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(unique=True)
    picture = models.ImageField(upload_to=student_picture_path, blank=True, null=True,
                              help_text="Upload student's passport photograph")
    registration_number = models.CharField(max_length=20, unique=True, null=True)
    days_present = models.IntegerField(default=0)
    school_days = models.IntegerField(default=0)
    last_term_average = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    position = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

    def get_attendance_percentage(self):
        if self.school_days == 0:
            return 0
        return (self.days_present / self.school_days) * 100
    
    def save(self, *args, **kwargs):
        if self.picture:
            # Handle image validation here if needed
            if self.picture.size > 2 * 1024 * 1024:  # 2MB limit
                raise ValidationError("Image file size too large ( > 2MB )")
        super().save(*args, **kwargs)

    @property
    def has_picture(self):
        return bool(self.picture)


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='enrollments')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='enrollments')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'term', 'session')

    def __str__(self):
        return f"{self.student} in {self.student_class} for {self.term} ({self.session})"


class Score(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    term = models.ForeignKey(Term, on_delete=models.CASCADE)
    ca_score = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Class Work')
    exam_score = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Term Exam')
    total = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2)
    position = models.IntegerField(null=True, blank=True)
    remark = models.CharField(max_length=20)
    teacher_sign = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        unique_together = ['student', 'subject', 'term']
        ordering = ['subject__name']

    def save(self, *args, **kwargs):
        from decimal import Decimal, ROUND_HALF_UP
        # Existing score calculations
        self.total = (Decimal(str(self.ca_score)) + Decimal(str(self.exam_score))).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
        
        # Determine grade and remark based on total score
        total = float(self.total)
        if total >= 70:
            self.grade = 'A1'
            self.remark = 'EXCELLENT'
        elif total >= 60:
            self.grade = 'B2'
            self.remark = 'V. GOOD'
        elif total >= 50:
            self.grade = 'C4'
            self.remark = 'CREDIT'
        elif total >= 45:
            self.grade = 'C5'
            self.remark = 'CREDIT'
        elif total >= 40:
            self.grade = 'C6'
            self.remark = 'CREDIT'
        else:
            self.grade = 'F9'
            self.remark = 'FAIL'

        super().save(*args, **kwargs)

        # Update result summary after saving score
        self.update_result_summary()

    def update_result_summary(self):
        # Get all scores for this student in this term
        student_scores = Score.objects.filter(
            student=self.student,
            term=self.term
        )
        
        if student_scores.exists():
            total_score = sum(score.total for score in student_scores)
            num_subjects = student_scores.count()
            avg_score = total_score / num_subjects

            # Create or update result summary
            ResultSummary.objects.update_or_create(
                student=self.student,
                term=self.term,
                session=self.term.session,
                defaults={
                    'total_score': total_score,
                    'average_score': avg_score,
                    'number_of_subjects': num_subjects
                }
            )

            # Update student's last term average
            self.student.last_term_average = avg_score
            self.student.save()


RATING_CHOICES = [
    ('A', 'A'),
    ('B', 'B'),
    ('C', 'C'),
    ('D', 'D'),
    ('E', 'E'),
]

class EffectiveDomain(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='effective_domains')
    term = models.ForeignKey('Term', on_delete=models.CASCADE)
    aesthetic = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Aesthetic')
    appreciation = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Appreciation')
    attendance = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Attendance in Class')
    honesty = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Honesty')
    initiative = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Initiative')
    leadership = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Leadership')
    neatness = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Neatness')
    obedience = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Obedience')
    punctuality = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Punctuality')
    sense_of_duty = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Sense of duty')
    self_control = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Self Control')
    sociability = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Sociability')

    class Meta:
        unique_together = ('student', 'term')
        verbose_name = 'Behaviour & Character Development'
        verbose_name_plural = 'Behaviour & Character Development'

    def __str__(self):
        return f"{self.student.firstname} {self.student.lastname} - {self.term.name} Behaviour & Character Development"

class PsychomotiveDomain(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='psychomotive_domains')
    term = models.ForeignKey('Term', on_delete=models.CASCADE)
    games = models.CharField(max_length=1, choices=RATING_CHOICES, default='A', verbose_name='Games & Sports')
    sport = models.CharField(max_length=1, choices=RATING_CHOICES)
    handling_tools = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Handling of tools frequently')
    hand_writing = models.CharField(max_length=1, choices=RATING_CHOICES)
    painting_drawing = models.CharField(max_length=1, choices=RATING_CHOICES, verbose_name='Painting & Drawing')
    musical_skills = models.CharField(max_length=1, choices=RATING_CHOICES)
    crafts = models.CharField(max_length=1, choices=RATING_CHOICES)

    class Meta:
        unique_together = ('student', 'term')
        verbose_name = 'Manual & Physical Skill'
        verbose_name_plural = 'Manual & Physical Skills'

    def __str__(self):
        return f"{self.student.firstname} {self.student.lastname} - {self.term.name} Manual & Physical Skills"


class School(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    logo = models.ImageField(upload_to='school/logo/', blank=True, null=True)
    principal_name = models.CharField(max_length=200)
    principal_signature = models.ImageField(upload_to='school/signatures/', blank=True, null=True)
    school_stamp = models.ImageField(upload_to='school/stamps/', blank=True, null=True)
    motto = models.CharField(max_length=200, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "School Details"
        # Ensure only one school record exists
        constraints = [
            models.CheckConstraint(check=models.Q(id=1), name='single_school_instance')
        ]

GRADE_CHOICES = [
    ('A', 'A - Excellent (80-100)'),
    ('B', 'B - Very Good (70-79)'),
    ('C', 'C - Good (65-69)'),
    ('D', 'D - Fair (50-64)'),
    ('E', 'E - Pass (40-49)'),
    ('F', 'F - Poor (0-39)'),
]

class CommentsTemplate(models.Model):
    COMMENT_TYPE_CHOICES = [
        ('principal', 'Principal'),
        ('teacher', 'Teacher'),
    ]
    
    grade = models.CharField(max_length=1, choices=GRADE_CHOICES)
    comment_type = models.CharField(max_length=10, choices=COMMENT_TYPE_CHOICES)
    comment = models.TextField()
    
    class Meta:
        unique_together = ('grade', 'comment_type')
        verbose_name = 'Comments Template'
        verbose_name_plural = 'Comments Templates'

    def __str__(self):
        return f"{self.get_comment_type_display()} Comment for Grade {self.grade}"


class ResultSummary(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='result_summaries')
    term = models.ForeignKey(Term, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    total_score = models.DecimalField(max_digits=7, decimal_places=2)
    average_score = models.DecimalField(max_digits=5, decimal_places=2)
    number_of_subjects = models.IntegerField()
    class_position = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'term', 'session')
        ordering = ['-session__name', '-term__name']
        verbose_name = 'Result Summary'
        verbose_name_plural = 'Result Summaries'

    def __str__(self):
        return f"{self.student} - {self.term} ({self.session})"
