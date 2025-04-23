from django.contrib import admin
from .models import Session, Term, Class, Subject, Student, Score, School, EffectiveDomain, PsychomotiveDomain, CommentsTemplate

admin.site.register(Session)
admin.site.register(Term)
admin.site.register(Class)
admin.site.register(Subject)
admin.site.register(Student)
admin.site.register(Score)
admin.site.register(School)
admin.site.register(EffectiveDomain)
admin.site.register(PsychomotiveDomain)
admin.site.register(CommentsTemplate)

