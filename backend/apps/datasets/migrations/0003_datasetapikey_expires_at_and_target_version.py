from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("datasets", "0002_alter_dataset_id_alter_datasetmember_id_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="datasetapikey",
            name="expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="datasetapikey",
            name="target_version",
            field=models.CharField(
                blank=True,
                help_text=(
                    "Optional dataset version tag this key is restricted to."
                ),
                max_length=100,
                null=True,
            ),
        ),
    ]
