# Generated by Django 4.0.5 on 2022-08-22 02:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noticiasApp', '0002_alter_videos_ruta'),
    ]

    operations = [
        migrations.AddField(
            model_name='noticias',
            name='ruta',
            field=models.FileField(null=True, upload_to='noticias'),
        ),
    ]
