from django.shortcuts import render
from carrerasApp.models import *
# Create your views here.
def listarcategoria(request,id):
    queryset=request.GET.get("buscar")
    categoria=Categoria.objects.filter(estado=True) 
    if queryset:
        categoria=Categoria.objects.filter(Q(descripcion__icontains=queryset),estado=True).distinct() 
    context={'categoria':categoria}
    return render(request,"categoria/listar.html",context) 