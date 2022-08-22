from multiprocessing import context
from django.shortcuts import render
from noticiasApp.models import Noticias
from django.db.models import Q

# Create your views here.
def muestraNoticias(request):
    noticia = Noticias.objects.filter(estado=True).order_by('-id').values()
    context = {'noticia':noticia}
    return render(request,"noticias.html",context)

