from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0004_task_completed_at_task_deadline_task_description_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="role",
            field=models.CharField(
                choices=[
                    ("admin", "Admin"),
                    ("annotator", "Annotator"),
                    ("viewer", "Viewer"),
                ],
                db_index=True,
                default="annotator",
                max_length=20,
            ),
        ),
    ]
