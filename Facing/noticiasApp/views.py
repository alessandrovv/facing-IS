from multiprocessing import context
from django.shortcuts import render
from noticiasApp.models import Noticias
from django.db.models import Q
from carrerasApp.models import *

# Create your views here.
escuelas=Escuelas.objects.all()


def muestraNoticias(request):
    noticia = Noticias.objects.filter(estado=True).order_by('-id').values()
    context = {'noticia':noticia,'escuelas':escuelas}
    return render(request,"noticias.html",context)

