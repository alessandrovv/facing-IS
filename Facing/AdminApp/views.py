from multiprocessing import context
import re
from socket import fromshare
from django.shortcuts import render,redirect,get_object_or_404,HttpResponseRedirect
import imp
from django.contrib import messages 
from carrerasApp.models import *
from django.db.models import Q
from .forms import *
from django.core.paginator import Paginator

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

# Create your views here.
def listarEscuela(request):
    queryset = request.GET.get("buscar")
    escuela = Escuelas.objects.filter(estado=True).order_by('-idescuela').values()
    if queryset:
        escuela = Escuelas.objects.filter(Q(nombre__icontains=queryset), estado=True).values()
    paginator = Paginator(escuela,3)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request,"escuelas/listar.html",{'page_obj':page_obj})

def agregarEscuela(request):
    form = EscuelaForm()
    if request.method == 'POST':
        form = EscuelaForm(request.POST)
        if form.is_valid():
            nombre_escuela_form = form.cleaned_data.get("nombre")
            escuela = Escuelas.objects.filter(Q(nombre__iexact=nombre_escuela_form), estado=True).values("nombre")
            if not escuela:
                form.save()
                return redirect("listarescuela")
            else:
                messages.error(request,"La escuela '"+ nombre_escuela_form +"' ya existe.")
        else:
            form=EscuelaForm()
    context = {'form':form}
    return render(request,"escuelas/agregar.html",context)

def editarEscuela(request,id):
    escuela = Escuelas.objects.get(idescuela=id)
    if request.method=='POST':
        form = EscuelaForm(request.POST,instance=escuela)
        if form.is_valid():
            form.save()
            return redirect("listarescuela")
    else:
        form=EscuelaForm(instance=escuela)
        context={'form':form}
        return render(request,"escuelas/editar.html",context)

def eliminarEscuela(request,id):
    escuela=Escuelas.objects.get(idescuela=id)
    escuela.estado = False
    escuela.save()
    return redirect("listarescuela")


def listarNoticia(request):
    queryset = request.GET.get("buscar")
    noticia = Noticias.objects.filter(estado=True).order_by('-id').values()
    if queryset:
        noticia = Noticias.objects.filter(Q(titulo__icontains=queryset) | Q(descripcion__icontains=queryset), estado=True).values()
    paginator = Paginator(noticia,3)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request,"noticias/listar.html",{'page_obj':page_obj})

def agregarNoticia(request):
    form = NoticiaForm()
    if request.method == 'POST':
        form = NoticiaForm(request.POST)
        if form.is_valid():
            titulo_noticia_form = form.cleaned_data.get("titulo")
            noticia = Noticias.objects.filter(Q(titulo__iexact=titulo_noticia_form), estado=True).values("titulo")
            if not noticia:
                form.save()
                return redirect("listarnoticia")
            else:
                messages.error(request,"La noticia '"+ titulo_noticia_form +"' ya existe.")
        else:
            form=NoticiaForm()
    context = {'form':form}
    return render(request,"noticias/agregar.html",context)

def editarNoticia(request,id):
    noticia = Noticias.objects.get(id=id)
    if request.method=='POST':
        form = NoticiaForm(request.POST,instance=noticia)
        if form.is_valid():
            form.save()
            return redirect("listarnoticia")
    else:
        form=NoticiaForm(instance=noticia)
        context={'form':form}
        return render(request,"noticias/editar.html",context)

def eliminarNoticia(request,id):
    noticia=Noticias.objects.get(id=id)
    noticia.estado = False
    noticia.save()
    return redirect("listarnoticia")
