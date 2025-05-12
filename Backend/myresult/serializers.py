from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Session, Term, Class, Subject, Student, Enrollment, Score, EffectiveDomain, PsychomotiveDomain, School, CommentsTemplate, ResultSummary

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'user_type', 'phone_number')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'

class TermSerializer(serializers.ModelSerializer):
    session_name = serializers.CharField(source='session.name', read_only=True)
    class Meta:
        model = Term
        fields = ['id', 'name', 'session', 'session_name']

class ClassSerializer(serializers.ModelSerializer):
    term_name = serializers.CharField(source='term.name', read_only=True)
    Session_name = serializers.CharField(source='term.session.name', read_only=True)
    class Meta:
        model = Class
        fields = ['id', 'name', 'term', 'term_name', 'Session_name']

class SubjectSerializer(serializers.ModelSerializer):
    class_group_name = serializers.CharField(source='class_group.name', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'class_group', 'class_group_name']

class StudentSerializer(serializers.ModelSerializer):
    current_class = serializers.SerializerMethodField()
    parent_name = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = Student
        fields = ['id', 'firstname', 'lastname', 'othername', 'email', 'picture', 'current_class', 'registration_number', 'days_present', 'parent_name']
    
    def get_current_class(self, obj):
        # Get the most recent enrollment for this student
        enrollment = obj.enrollments.order_by('-enrollment_date').first()
        if enrollment:
            return {
                'id': enrollment.student_class.id,
                'name': enrollment.student_class.name
            }
        return None
    
class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True, required=False)
    class_name = serializers.CharField(source='student_class.name', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)
    session_name = serializers.CharField(source='session.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_id', 'student_class', 'class_name', 'term', 'term_name', 'session', 'session_name', 'enrollment_date']

class BulkStudentEnrollmentSerializer(serializers.Serializer):
    firstname = serializers.CharField()
    lastname = serializers.CharField()
    email = serializers.EmailField()
    student_class = serializers.PrimaryKeyRelatedField(queryset=Class.objects.all())
    term = serializers.PrimaryKeyRelatedField(queryset=Term.objects.all())
    session = serializers.PrimaryKeyRelatedField(queryset=Session.objects.all())
    picture = serializers.ImageField(required=False, allow_null=True)

class ScoreInputSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    ca_score = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100, label='Class Work')
    exam_score = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100, label='Term Exam')

    def validate(self, data):
        if data['ca_score'] > 100:
            raise serializers.ValidationError("Class Work score cannot exceed 100")
        if data['exam_score'] > 100:
            raise serializers.ValidationError("Term Exam score cannot exceed 100")
        return data

class ScoresSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.__str__', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)
    class_name = serializers.CharField(source='subject.class_group.name', read_only=True)
    session_name = serializers.CharField(source='term.session.name', read_only=True)

    class Meta:
        model = Score
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name', 
                 'term', 'term_name', 'class_name', 'session_name',
                 'ca_score', 'exam_score', 'total', 'grade', 'remark']

class ScoreSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    student_name = serializers.CharField(source='student.__str__', read_only=True)
    ca_score = serializers.DecimalField(max_digits=5, decimal_places=2, label='Class Work')
    exam_score = serializers.DecimalField(max_digits=5, decimal_places=2, label='Term Exam')

    class Meta:
        model = Score
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name', 'term', 'ca_score', 'exam_score', 
                 'total', 'grade', 'position', 'remark', 'teacher_sign']
        read_only_fields = ['total', 'grade', 'remark']

class EffectiveDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = EffectiveDomain
        fields = '__all__'

class PsychomotiveDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = PsychomotiveDomain
        fields = '__all__'

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = '__all__'

class CommentsTemplateSerializer(serializers.ModelSerializer):
    grade_display = serializers.CharField(source='get_grade_display', read_only=True)
    comment_type_display = serializers.CharField(source='get_comment_type_display', read_only=True)
    
    class Meta:
        model = CommentsTemplate
        fields = ['id', 'grade', 'grade_display', 'comment_type', 'comment_type_display', 'comment']

class ResultSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.__str__', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)
    session_name = serializers.CharField(source='session.name', read_only=True)

    class Meta:
        model = ResultSummary
        fields = ['id', 'student', 'student_name', 'term', 'term_name', 
                 'session', 'session_name', 'total_score', 'average_score',
                 'number_of_subjects', 'class_position', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']