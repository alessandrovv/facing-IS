from operator import mod
from pyexpat import model
from tkinter import CASCADE
from turtle import ondrag
from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Noticias(models.Model):
    id=models.AutoField(primary_key=True)
    titulo=models.TextField()
    descripcion=models.TextField()
    seccion=models.SmallIntegerField()
    fecha=models.DateTimeField()
    idusuario=models.ForeignKey(User,on_delete=models.CASCADE)
    estado=models.BooleanField(default=True)

class Noticias_imagenes(models.Model):
    id=models.AutoField(primary_key=True)
    titulo=models.TextField()
    idnoticia=models.ForeignKey(Noticias,on_delete=models.CASCADE)

class Videos(models.Model):
    id=models.AutoField(primary_key=True)
    ruta=models.FileField(upload_to='videos',null=True)
    titulo=models.TextField()
    descripcion=models.TextField()
    seccion=models.SmallIntegerField()
    idusuario=models.ForeignKey(User,on_delete=models.CASCADE)
    estado=models.BooleanField(default=True)

    