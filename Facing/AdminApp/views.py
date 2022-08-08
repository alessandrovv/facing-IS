from multiprocessing import context
import re
from socket import fromshare
from django.shortcuts import render,redirect,get_object_or_404,HttpResponseRedirect
import imp
from carrerasApp.models import Ciclos, Docentes
from django.db.models import Q
from .forms import CiclosForm, DocentesForm

# Create your views here.
def dashboard(request):
    return render(request,'dashboard.html')

def listarciclo(request):
    queryset=request.GET.get("buscar")
    ciclo=Ciclos.objects.all()
    if queryset:
        ciclo=Ciclos.objects.filter(Q(ciclo__icontains=queryset)).distinct() 
    context={'ciclo':ciclo}
    return render(request,"noticiasimagenes/listar.html",context)

def agregarciclo(request):
    form = CiclosForm()
    if request.method=="POST":
        form= CiclosForm(request.POST)
        if form.is_valid():
            form.save() 
            return redirect("ciclos")
        else:
            form=CiclosForm()
    context={'form':form} 
    return render(request,"noticiasimagenes/agregar.html",context) 

def editarciclo(request,id):
    if request.method == "POST":
        if id==None:
            form =CiclosForm(request.POST)
        else:
            ciclo = Ciclos.objects.get(pk=id)
            form = CiclosForm(request.POST, instance=ciclo)
        if form.is_valid():
            form.save()
        return redirect("ciclos")
    else:
        if id==None:
            form=CiclosForm()
        else:
            ciclo = Ciclos.objects.get(pk = id)
            form = CiclosForm(instance=ciclo)
        return render(request,"noticiasimagenes/editar.html",{'form':form})
    
def eliminarciclo(request,id):
    context ={}
    obj = get_object_or_404(Ciclos, id = id)
    obj.delete()
    return redirect("ciclos")

def listardocente(request):
    queryset=request.GET.get("buscar")
    docente=Docentes.objects.all()
    if queryset:
        docente=Docentes.objects.filter(Q(docente__icontains=queryset)).distinct() 
    context={'docente':docente}
    return render(request,"docentes/listar.html",context)

def agregardocente(request):
    form = DocentesForm()
    if request.method=="POST":
        form= DocentesForm(request.POST,request.FILES)
        if form.is_valid():
            form.save() 
            return redirect("docentes")
        else:
            form = DocentesForm()
            print (request.POST)
    context={'form':form} 
    return render(request,"docentes/agregar.html",context) 

def editardocente(request,id):
    if request.method == "POST":
        if id==None:
            form = DocentesForm(request.POST)
        else:
            docente = Docentes.objects.get(pk=id)
            form = DocentesForm(request.POST,request.FILES, instance=docente)
        if form.is_valid():
            form.save()
        return redirect("docentes")
    else:
        if id==None:
            form = DocentesForm()
        else:
            docente = Docentes.objects.get(pk = id)
            form = DocentesForm(instance=docente)
        return render(request,"docentes/editar.html",{'form':form})
    
def eliminardocente(request,id):
    context ={}
    obj = get_object_or_404(Docentes, idDocente = id)
    obj.delete()
    return redirect("docentes")