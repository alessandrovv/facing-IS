from distutils.command.upload import upload
from operator import mod, truediv
from pyexpat import model
from tkinter import CASCADE
from django.db import models

class Escuelas(models.Model):
    idescuela=models.AutoField(primary_key=True)
    nombre=models.CharField(max_length=30)
    slug=models.CharField(max_length=12)
    visto=models.IntegerField()
    estado=models.BooleanField(default=True)

class Docentes(models.Model):
    idDocente=models.AutoField(primary_key=True)
    Nombre=models.CharField(max_length=40)
    ImagenRuta=models.ImageField(upload_to="docentes", null=True, default="docentes/perfil.jpg")
    idEscuela=models.ForeignKey(Escuelas, on_delete=models.CASCADE)
    
class Grado_docente(models.Model):
    idgrado=models.AutoField(primary_key=True)
    iddocente=models.ForeignKey(Docentes,on_delete=models.CASCADE)
    grado=models.TextField()

class Exp_lab(models.Model):
    idexp=models.AutoField(primary_key=True)
    iddocente=models.ForeignKey(Docentes, on_delete=models.CASCADE)
    exp=models.TextField()
    
class Ciclos(models.Model):
    id=models.AutoField(primary_key=True)
    ciclo=models.CharField(max_length=4)

class Curriculas(models.Model):
    codigo=models.CharField(primary_key=True, max_length=5)
    codigoint=models.CharField(max_length=4)
    asignatura=models.CharField(max_length=69)
    tipo=models.CharField(max_length=2)
    creditos=models.SmallIntegerField()
    condicion=models.CharField(max_length=1)
    ht=models.SmallIntegerField()
    hp=models.SmallIntegerField()
    hl=models.SmallIntegerField()
    requisito=models.CharField(max_length=19)
    departamento=models.CharField(max_length=36)
    idciclo=models.ForeignKey(Ciclos, on_delete=models.CASCADE)
    idescuela=models.ForeignKey(Escuelas, on_delete=models.CASCADE)