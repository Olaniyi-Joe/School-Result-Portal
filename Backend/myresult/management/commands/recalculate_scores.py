from django.core.management.base import BaseCommand
from myresult.models import Score
from decimal import Decimal, ROUND_HALF_UP

class Command(BaseCommand):
    help = 'Recalculates total scores and grades for all existing scores'

    def handle(self, *args, **kwargs):
        scores = Score.objects.all()
        total_updated = 0

        for score in scores:
            # Store old values for comparison
            old_total = score.total
            old_grade = score.grade
            old_remark = score.remark

            # Recalculate total
            score.total = (Decimal(str(score.ca_score)) + Decimal(str(score.exam_score))).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
            
            # Recalculate grade and remark
            total = float(score.total)
            if total >= 70:
                score.grade = 'A1'
                score.remark = 'EXCELLENT'
            elif total >= 60:
                score.grade = 'B2'
                score.remark = 'V. GOOD'
            elif total >= 50:
                score.grade = 'C4'
                score.remark = 'CREDIT'
            elif total >= 45:
                score.grade = 'C5'
                score.remark = 'CREDIT'
            elif total >= 40:
                score.grade = 'C6'
                score.remark = 'CREDIT'
            else:
                score.grade = 'F9'
                score.remark = 'FAIL'

            # Only save if there were changes
            if old_total != score.total or old_grade != score.grade or old_remark != score.remark:
                score.save()
                total_updated += 1
                self.stdout.write(
                    f"Updated score for Student: {score.student}, Subject: {score.subject}\n"
                    f"Old: total={old_total}, grade={old_grade}, remark={old_remark}\n"
                    f"New: total={score.total}, grade={score.grade}, remark={score.remark}\n"
                )

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {total_updated} scores'))