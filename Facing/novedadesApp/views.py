from django.shortcuts import render
from noticiasApp.models import Videos
from carrerasApp.models import *

# Create your views here.
escuelas=Escuelas.objects.all()

def concursodocente(request):   
    video = Videos.objects.filter(seccion='1').filter(estado=True).order_by('-id').values()
    context={'video':video,'escuelas':escuelas}
    return render(request,'novedades/concursodocente.html', context)

def resolucionesconsejo(request):
    video = Videos.objects.filter(seccion='2').filter(estado=True).order_by('-id').values()
    context={'video':video,'escuelas':escuelas}
    return render(request,'novedades/resolucionesconsejo.html', context)

def virtual(request):
    video = Videos.objects.filter(seccion='3').filter(estado=True).order_by('-id').values()
    context={'video':video,'escuelas':escuelas}
    return render(request,'novedades/virtual.html', context)

def calidad(request):
    video = Videos.objects.filter(seccion='4').filter(estado=True).order_by('-id').values()
    context={'video':video,'escuelas':escuelas}
    return render(request,'novedades/calidad.html', context)
