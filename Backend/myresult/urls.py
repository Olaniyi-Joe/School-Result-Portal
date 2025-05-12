from rest_framework.routers import DefaultRouter
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from authentication.views import RegisterUserView
from .views import (
    SessionViewSet, TermViewSet, terms_by_session, ClassViewSet, SubjectViewSet,
    subjects_by_class, StudentViewSet, EnrollmentViewSet, BulkStudentEnrollmentView,
    students_by_subject_in_class, input_scores, student_scores, filter_scores,
    bulk_create_subjects, student_class, student_detail, EffectiveDomainViewSet,
    PsychomotiveDomainViewSet, SchoolViewSet, CommentsTemplateViewSet,
    ResultSummaryViewSet, student_result_history, class_rankings, classes_by_term, subjects_by_class, subject_student_scores,
    get_school_details, BulkEnrollmentFromFileView, promote_or_demote_students
)

router = DefaultRouter()


# Existing routes
router.register(r'sessions', SessionViewSet)
router.register(r'terms', TermViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'students', StudentViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'effective-domains', EffectiveDomainViewSet)
router.register(r'psychomotive-domains', PsychomotiveDomainViewSet)
router.register(r'school', SchoolViewSet)
router.register(r'comments-templates', CommentsTemplateViewSet)
router.register(r'result-summaries', ResultSummaryViewSet)

urlpatterns = [
    
    # paths
    path('', include(router.urls)),
    path('sessions/<int:session_id>/terms/', terms_by_session, name="terms_by_session"),
    path('classes/<int:class_id>/subjects/', subjects_by_class, name='subjects_by_class'),
    path('bulk-create/subjects/', bulk_create_subjects, name='bulk-create-subjects'),
    path("bulk/enrollments/", BulkStudentEnrollmentView.as_view(), name="bulk-student-enrollment"),
    path('bulk/enrollments/file/', BulkEnrollmentFromFileView.as_view(), name='bulk-enrollment-from-file'),
    path('stu/class/<int:class_id>/subjects/<int:subject_id>/students/', students_by_subject_in_class, name='students_by_subject_in_class'),
    path(
    'scores/input/subject/<int:subject_id>/class/<int:class_id>/term/<int:term_id>/',
    input_scores,
    name='input_scores_subject_class_term'),
    path('scores/student/<int:student_id>/', student_scores, name='student_scores'),
    path('scores/filter/', filter_scores, name='filter_scores'),
    path('students/<int:student_id>/class/', student_class, name='student_class'),
    path('students/<int:student_id>/details/', student_detail, name='student_detail'),
    path('students/<int:student_id>/result-history/', student_result_history, name='student-result-history'),
    path('classes/<int:class_id>/terms/<int:term_id>/rankings/', class_rankings, name='class-rankings'),
    path('terms/<int:term_id>/classes/', classes_by_term, name='classes_by_term'),
    path('classes/<int:class_id>/subjects/', subjects_by_class, name='subjects_by_class'),
    path('subjects/<int:subject_id>/scores/', subject_student_scores, name='subject_student_scores'),
    path('schools/details/', get_school_details, name='get_school_details'),
    path('student/promote-or-demote/', promote_or_demote_students, name='promote_or_demote_students'),
]
