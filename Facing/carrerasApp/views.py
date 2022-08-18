from django.shortcuts import render
from carrerasApp.models import *
# Create your views here.
def listarcategoria(request,id):
    escuela= Escuelas.objects.get(idescuela = id)
    docentes = Docentes.objects.get(idEscuela = id)
    grados = Docentes.objects.filter()
    return render(request,"categoria/listar.html",context) 