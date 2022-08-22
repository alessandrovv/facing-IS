

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noticiasApp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='videos',
            name='ruta',
            field=models.FileField(null=True, upload_to='videos'),
        ),
    ]
