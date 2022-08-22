

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('carrerasApp', '0002_rename_imagenruta_docentes_imagenruta_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='docentes',
            name='ImagenRuta',
            field=models.ImageField(default='docentes/perfil.jpg', null=True, upload_to='docentes'),
        ),
    ]
