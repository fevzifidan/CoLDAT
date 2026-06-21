from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("projects", "0002_alter_project_id_alter_projectmembership_id_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="projectmembership",
            name="role",
        ),
    ]
