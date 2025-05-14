from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
import pandas as pd
from .permissions import IsSuperAdmin, IsSchoolAdmin, IsTeacher, IsParent
from .models import Term, Session, Class, Subject, Student, Enrollment, Score, EffectiveDomain, PsychomotiveDomain, School, CommentsTemplate, ResultSummary
from .serializers import TermSerializer, SessionSerializer, ClassSerializer, SubjectSerializer, StudentSerializer, EnrollmentSerializer, BulkStudentEnrollmentSerializer, ScoreSerializer, ScoreInputSerializer, EffectiveDomainSerializer, PsychomotiveDomainSerializer, SchoolSerializer, CommentsTemplateSerializer, ResultSummarySerializer

import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class SessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    
class TermViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Term.objects.all()
    serializer_class = TermSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def terms_by_session(request, session_id):
    """
    Return all terms under a given session.
    """
    try:
        session = Session.objects.get(id=session_id)
        terms = Term.objects.filter(session=session)
        serializer = TermSerializer(terms, many=True)
        return Response(serializer.data)
    except Session.DoesNotExist:
        return Response({"error": "Session not found"}, status=404)

class ClassViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        class_group_name = self.request.query_params.get('class_group_name')
        if class_group_name:
            queryset = queryset.filter(class_group__name__iexact=class_group_name)
        return queryset

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        class_group_id = request.data.get('class_group')

        # Check if this subject already exists for the class
        if Subject.objects.filter(name__iexact=name, class_group_id=class_group_id).exists():
            return Response(
                {"error": f"Subject '{name}' already exists for the selected class."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_create_subjects(request):
    """
    Payload example:
    {
        "class_group_id": 1,
        "subjects": ["Math", "English", "Biology"]
    }
    """
    class_group_id = request.data.get("class_group_id")
    subject_names = request.data.get("subjects", [])

    if not class_group_id or not subject_names:
        return Response({"error": "class_group_id and subjects list are required."}, status=400)

    try:
        class_group = Class.objects.get(id=class_group_id)
    except Class.DoesNotExist:
        return Response({"error": "Class not found."}, status=404)

    created = []
    skipped = []

    for name in subject_names:
        name = name.strip()
        if Subject.objects.filter(name__iexact=name, class_group=class_group).exists():
            skipped.append(name)
        else:
            Subject.objects.create(name=name, class_group=class_group)
            created.append(name)

    return Response({
        "created": created,
        "skipped (already existed)": skipped
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subjects_by_class(request, class_id):
    try:
        class_instance = Class.objects.get(id=class_id)
        subjects = Subject.objects.filter(class_group=class_instance)
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    except Class.DoesNotExist:
        return Response({"error": "Class not found"}, status=404)

class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        parent_name = data.get('parent_name')
        if parent_name:
            data['parent_name'] = parent_name
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        data = request.data
        parent_name = data.get('parent_name')
        if parent_name:
            data['parent_name'] = parent_name
        return super().update(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        class_id = self.request.query_params.get('class')
        if class_id:
            queryset = queryset.filter(enrollments__student_class_id=class_id)
        return queryset

class EnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        # Get student data from payload
        student_data = {
            "firstname": request.data.get('firstname'),
            "lastname": request.data.get('lastname'),
            "othername": request.data.get('othername', ""),
            "email": request.data.get('email'),
            "picture": request.data.get('picture'),
            "registration_number": request.data.get('registration_number'),
            "days_present": request.data.get('days_present'),
            "parent_name": request.data.get('parent_name')
        }
        # Create the student
        student_serializer = StudentSerializer(data=student_data)
        student_serializer.is_valid(raise_exception=True)
        student = student_serializer.save()

        # Now create the enrollment for this student.
        enrollment_data = {
            "student_id": student.id,  # we use the created student's ID
            "student_class": request.data.get('student_class'),
            "term": request.data.get('term'),
            "session": request.data.get('session')
        }
        enrollment_serializer = EnrollmentSerializer(data=enrollment_data)
        enrollment_serializer.is_valid(raise_exception=True)
        enrollment_serializer.save()

        return Response(
            {
                "student": student_serializer.data,
                "enrollment": enrollment_serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        enrollment = self.get_object()
        student = enrollment.student

        # Handle picture removal if requested
        if request.data.get('remove_picture', False):
            if student.picture:
                student.picture.delete()  # This will delete the file
                student.picture = None

        # Update student info
        student_data = {
            'firstname': request.data.get('firstname', student.firstname),
            'lastname': request.data.get('lastname', student.lastname),
            'email': request.data.get('email', student.email),
            'registration_number': request.data.get('registration_number', student.registration_number),
            'days_present': request.data.get('days_present', student.days_present),
            'parent_name': request.data.get('parent_name', student.parent_name),
        }

        # Handle new picture upload
        if 'picture' in request.FILES:
            student_data['picture'] = request.FILES['picture']

        student_serializer = StudentSerializer(student, data=student_data, partial=True)
        student_serializer.is_valid(raise_exception=True)
        student_serializer.save()

        # Update enrollment info
        enrollment_data = {
            'student_class': request.data.get('student_class', enrollment.student_class.id),
            'term': request.data.get('term', enrollment.term.id),
            'session': request.data.get('session', enrollment.session.id)
        }

        serializer = self.get_serializer(enrollment, data=enrollment_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "student": student_serializer.data,
            "enrollment": serializer.data
        })

class BulkStudentEnrollmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BulkStudentEnrollmentSerializer(data=request.data, many=True)
        if serializer.is_valid():
            created = []
            errors = []

            for entry in serializer.validated_data:
                try:
                    student, created_student = Student.objects.get_or_create(
                        email=entry["email"],
                        defaults={
                            "firstname": entry["firstname"],
                            "lastname": entry["lastname"],
                            "picture": entry.get("picture"),
                        }
                    )
                    # Even if student exists, enroll
                    Enrollment.objects.get_or_create(
                        student=student,
                        student_class=entry["student_class"],
                        term=entry["term"],
                        session=entry["session"]
                    )
                    created.append(student.email)
                except Exception as e:
                    errors.append({"email": entry["email"], "error": str(e)})

            return Response({
                "successfully_registered": created,
                "errors": errors
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BulkEnrollmentFromFileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Get class_id, term_id, and session_id from request parameters
        class_id = request.data.get('class_id')
        term_id = request.data.get('term_id')
        session_id = request.data.get('session_id')

        if not class_id or not term_id or not session_id:
            return Response({"error": "class_id, term_id, and session_id are required parameters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Determine file type and read content
            if file.name.endswith('.csv'):
                data = pd.read_csv(file)
            elif file.name.endswith(('.xls', '.xlsx')):
                data = pd.read_excel(file)
            else:
                return Response({"error": "Unsupported file format. Use CSV or Excel."}, status=status.HTTP_400_BAD_REQUEST)

            # Validate required columns
            required_columns = ['firstname', 'lastname', 'othername', 'email', 'picture', 'registration_number', 'parent_name']
            if not all(col in data.columns for col in required_columns):
                return Response({"error": f"Missing required columns: {required_columns}"}, status=status.HTTP_400_BAD_REQUEST)

            created = []
            errors = []

            for _, row in data.iterrows():
                try:
                    # Create or get student
                    student_data = {
                        "firstname": row['firstname'],
                        "lastname": row['lastname'],
                        "othername": row.get('othername', ""),
                        "email": row.get('email', None),
                        "picture": row.get('picture', None),
                        "registration_number": row['registration_number'],
                        "parent_name": row.get('parent_name', None)
                    }
                    student, _ = Student.objects.get_or_create(
                        registration_number=row['registration_number'], defaults=student_data
                    )

                    # Create enrollment
                    enrollment_data = {
                        "student": student.id,
                        "student_class": class_id,
                        "term": term_id,
                        "session": session_id
                    }
                    enrollment_serializer = EnrollmentSerializer(data=enrollment_data)
                    enrollment_serializer.is_valid(raise_exception=True)
                    enrollment_serializer.save()

                    created.append(student.registration_number)
                except Exception as e:
                    errors.append({"registration_number": row['registration_number'], "error": str(e)})

            return Response({
                "successfully_enrolled": created,
                "errors": errors
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def students_by_subject_in_class(request, class_id, subject_id):
    try:
        class_obj = Class.objects.get(id=class_id)
    except Class.DoesNotExist:
        return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        subject = Subject.objects.get(id=subject_id, class_group=class_obj)
    except Subject.DoesNotExist:
        return Response({"error": "Subject not found in this class."}, status=status.HTTP_404_NOT_FOUND)

    # Get enrollments in the class
    enrollments = Enrollment.objects.filter(student_class=class_obj)
    students = [enrollment.student for enrollment in enrollments]

    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def input_scores(request, subject_id, class_id, term_id):
    subject = get_object_or_404(Subject, id=subject_id, class_group_id=class_id)
    term = get_object_or_404(Term, id=term_id)

    # Check if the request.user is authorized to enter scores for this subject
    # if subject.teacher.user != request.user:
       # return Response({"detail": "You are not authorized to input scores for this subject."}, status=status.HTTP_403_FORBIDDEN)

    # Get all students enrolled in the subject's class for the given term
    enrolled_students = Enrollment.objects.filter(student_class_id=class_id, term=term).select_related('student')
    student_ids = [e.student.id for e in enrolled_students]

    # Loop through incoming scores
    scores_data = request.data.get('scores', [])
    errors = []
    created_or_updated = []

    for score in scores_data:
        serializer = ScoreInputSerializer(data=score)
        if serializer.is_valid():
            student_id = serializer.validated_data['student_id']
            if student_id not in student_ids:
                errors.append(f"Student {student_id} is not enrolled in this class.")
                continue

            score_obj, created = Score.objects.update_or_create(
                student_id=student_id,
                subject=subject,
                term=term,
                defaults={
                    'ca_score': serializer.validated_data['ca_score'],
                    'exam_score': serializer.validated_data['exam_score']
                }
            )
            created_or_updated.append(score_obj.student.email)
        else:
            errors.append(serializer.errors)

    return Response({
        "scores_processed": created_or_updated,
        "errors": errors
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_scores(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

    scores = Score.objects.filter(student=student)
    serializer = ScoreSerializer(scores, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def filter_scores(request):
    subject_id = request.GET.get('subject_id')
    class_id = request.GET.get('class_id')
    student_id = request.GET.get('student_id')
    term_id = request.GET.get('term_id')

    scores = Score.objects.all()

    if subject_id:
        scores = scores.filter(subject_id=subject_id)
    if class_id:
        scores = scores.filter(student__enrollments__student_class_id=class_id)
    if student_id:
        scores = scores.filter(student_id=student_id)
    if term_id:
        scores = scores.filter(term_id=term_id)

    # Add related fields for better serialization
    scores = scores.select_related('student', 'subject', 'term', 'subject__class_group')
    
    serializer = ScoreSerializer(scores.distinct(), many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_class(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get most recent enrollment
    enrollment = Enrollment.objects.filter(student=student).order_by('-enrollment_date').first()
    
    if not enrollment:
        return Response({'error': 'Student not enrolled in any class'}, status=status.HTTP_404_NOT_FOUND)
    
    class_data = {
        'id': enrollment.student_class.id,
        'name': enrollment.student_class.name,
        'term_id': enrollment.term.id,
        'term_name': enrollment.term.name,
        'session_id': enrollment.session.id,
        'session_name': enrollment.session.name
    }
    
    return Response(class_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_detail(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get most recent enrollment
    Enrollment.objects.filter(student=student).order_by('-enrollment_date').first()
    
    # Serialize student data
    student_data = StudentSerializer(student).data
    
    # Add enrollment information if available
    if Enrollment:
        student_data['class'] = {
            'id': Enrollment.student_class.id,
            'name': Enrollment.student_class.name,
        }
        student_data['term'] = {
            'id': Enrollment.term.id,
            'name': Enrollment.term.name,
        }
        student_data['session'] = {
            'id': Enrollment.session.id,
            'name': Enrollment.session.name,
        }
    
    return Response(student_data, status=status.HTTP_200_OK)

class EffectiveDomainViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = EffectiveDomain.objects.all()
    serializer_class = EffectiveDomainSerializer

    def get_queryset(self):
        queryset = EffectiveDomain.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        term_id = self.request.query_params.get('term_id', None)
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if term_id:
            queryset = queryset.filter(term_id=term_id)
            
        return queryset

class PsychomotiveDomainViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PsychomotiveDomain.objects.all()
    serializer_class = PsychomotiveDomainSerializer

    def get_queryset(self):
        queryset = PsychomotiveDomain.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        term_id = self.request.query_params.get('term_id', None)
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if term_id:
            queryset = queryset.filter(term_id=term_id)
            
        return queryset

class SchoolViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

    def create(self, request, *args, **kwargs):
        try:
            if School.objects.exists():
                return Response(
                    {"detail": "School details already exist. Use PUT to update."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": "An error occurred while creating the school record.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        instance = School.objects.first()
        if not instance:
            return Response(
                {"detail": "No school details found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class CommentsTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CommentsTemplate.objects.all()
    serializer_class = CommentsTemplateSerializer

    def get_queryset(self):
        queryset = CommentsTemplate.objects.all()
        grade = self.request.query_params.get('grade', None)
        comment_type = self.request.query_params.get('comment_type', None)
        
        if grade:
            queryset = queryset.filter(grade=grade)
        if comment_type:
            queryset = queryset.filter(comment_type=comment_type)
            
        return queryset

class ResultSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ResultSummary.objects.all()
    serializer_class = ResultSummarySerializer
    filterset_fields = ['student', 'term', 'session']

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_result_history(request, student_id):
    """Get a student's result history across all terms and sessions."""
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

    summaries = ResultSummary.objects.filter(student=student).select_related('term', 'session')
    serializer = ResultSummarySerializer(summaries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_rankings(request, class_id, term_id):
    """Get rankings for all students in a class for a specific term."""
    try:
        class_obj = Class.objects.get(id=class_id)
        term = Term.objects.get(id=term_id)
    except (Class.DoesNotExist, Term.DoesNotExist):
        return Response({'error': 'Class or Term not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get all students in the class
    enrollments = Enrollment.objects.filter(student_class=class_obj, term=term)
    
    # Get their result summaries
    summaries = []
    for enrollment in enrollments:
        summary = ResultSummary.objects.filter(
            student=enrollment.student,
            term=term
        ).first()
        
        if summary:
            summaries.append(summary)
    
    # Sort by average score
    summaries.sort(key=lambda x: x.average_score, reverse=True)
    
    # Update positions
    for index, summary in enumerate(summaries, 1):
        summary.class_position = index
        summary.save()
    
    serializer = ResultSummarySerializer(summaries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classes_by_term(request, term_id):
    try:
        term = Term.objects.get(id=term_id)
        classes = Class.objects.filter(term=term)
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)
    except Term.DoesNotExist:
        return Response({"error": "Term not found"}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subject_student_scores(request, subject_id):
    try:
        # Fetch the subject and retrieve associated class and term
        subject = get_object_or_404(Subject, id=subject_id)
        student_class = subject.class_group
        # Fetch the term through the class_group relationship
        term = subject.class_group.term

        if request.method == 'GET':
            # Fetch students in the class
            enrollments = Enrollment.objects.filter(student_class=student_class, term=term)
            students = [enrollment.student for enrollment in enrollments]

            # Fetch scores for the subject and term
            scores = Score.objects.filter(subject=subject, term=term, student__in=students)

            # Map students to their scores
            student_scores = []
            for student in students:
                score = scores.filter(student=student).first()
                student_scores.append({
                    'student_id': student.id,
                    'student_name': f"{student.firstname} {student.lastname}",
                    'ca_score': score.ca_score if score else 0,
                    'exam_score': score.exam_score if score else 0,
                    'total_score': (score.ca_score + score.exam_score) if score else 0,
                    'has_existing_score': bool(score)
                })

            return Response(student_scores, status=200)

        elif request.method == 'POST':
            # Update or create scores for students
            scores_data = request.data.get('scores', [])
            for score_data in scores_data:
                student_id = score_data.get('student_id')
                ca_score = score_data.get('ca_score', 0)
                exam_score = score_data.get('exam_score', 0)

                student = get_object_or_404(Student, id=student_id)

                Score.objects.update_or_create(
                    student=student,
                    subject=subject,
                    term=term,
                    defaults={
                        'ca_score': ca_score,
                        'exam_score': exam_score
                    }
                )

            return Response({'message': 'Scores updated successfully'}, status=200)

    except Exception as e:
        logger.error(f"Error in subject_student_scores: {str(e)}")
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_school_details(request):
    try:
        school = School.objects.first()
        if not school:
            return Response({"error": "School details not found."}, status=404)

        return Response({
            "name": school.name,
            "logo": school.logo.url if school.logo else ""
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def promote_or_demote_students(request):
    """
    Promote or demote students by updating their enrollment records.
    Payload example:
    {
        "students": [
            {
                "student_id": 1,
                "new_class_id": 2,
                "new_session_id": 3
            },
            {
                "student_id": 2,
                "new_class_id": 1,
                "new_session_id": 3
            }
        ]
    }
    """
    logger.info("Received request to promote or demote students.")
    logger.debug(f"Request data: {request.data}")

    students_data = request.data.get("students", [])

    if not students_data:
        logger.warning("No students data provided in the request.")
        return Response({"error": "No students data provided."}, status=status.HTTP_400_BAD_REQUEST)

    updated_students = []
    errors = []

    for student_data in students_data:
        student_id = student_data.get("student_id")
        new_class_id = student_data.get("new_class_id")
        new_session_id = student_data.get("new_session_id")

        logger.debug(f"Processing student_id: {student_id}, new_class_id: {new_class_id}, new_session_id: {new_session_id}")

        if not (student_id and new_class_id and new_session_id):
            logger.error(f"Missing required fields for student_id: {student_id}")
            errors.append({"student_id": student_id, "error": "Missing required fields."})
            continue

        try:
            # Check if an enrollment with the new class and session already exists
            existing_enrollment = Enrollment.objects.filter(
                student_id=student_id,
                student_class_id=new_class_id,
                session_id=new_session_id
            ).exists()

            if existing_enrollment:
                logger.warning(f"Enrollment already exists for student_id: {student_id} in class_id: {new_class_id} and session_id: {new_session_id}")
                errors.append({"student_id": student_id, "error": "Enrollment already exists."})
                continue

            # Update the existing enrollment
            enrollment = Enrollment.objects.filter(student_id=student_id).latest('id')
            enrollment.student_class_id = new_class_id
            enrollment.session_id = new_session_id
            enrollment.save()
            updated_students.append(student_id)
            logger.info(f"Successfully updated enrollment for student_id: {student_id}")
        except Enrollment.DoesNotExist:
            logger.error(f"Enrollment not found for student_id: {student_id}")
            errors.append({"student_id": student_id, "error": "Enrollment not found."})
        except Exception as e:
            logger.exception(f"Error updating enrollment for student_id: {student_id}")
            errors.append({"student_id": student_id, "error": str(e)})

    logger.info("Finished processing promote or demote request.")
    logger.debug(f"Updated students: {updated_students}, Errors: {errors}")

    return Response({
        "updated_students": updated_students,
        "errors": errors
    }, status=status.HTTP_200_OK)
