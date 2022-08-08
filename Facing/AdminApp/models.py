from django.db import models

# Create your models here.

class Escuela(models.Model):
   idEscuela = models.AutoField(primary_key=True)
   nombre = models.CharField(max_length=30)
   slug = models.CharField(max_length=12)
   visto = models.IntegerField()
   estado = models.BooleanField(default=True)

class Noticia(models.Model):
    idNoticia = models.AutoField(primary_key=True)
    titulo = models.TextField()
    descripcion = models.TextField()
    seccion = models.TextField()
    fecha = models.DateField()
    estado = models.BooleanField(default=True)

   