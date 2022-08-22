from django.db import models

# Create your models here.
class Tesis(models.Model):
    id=models.AutoField(primary_key=True)
    ruta=models.FileField(upload_to='tesis',null=True)
    titulo=models.TextField()
    descripcion=models.TextField()
    autor=models.CharField(max_length=30)

    