from django.shortcuts import render, redirect
from AdminApp.models import *
from django.db.models import Q
from .forms import *
from django.contrib import messages 
from django.core.paginator import Paginator

def dashboard(request):
    return render(request,'dashboard.html')

# Create your views here.
def listarEscuela(request):
    queryset = request.GET.get("buscar")
    escuela = Escuela.objects.filter(estado=True).order_by('-idEscuela').values()
    if queryset:
        escuela = Escuela.objects.filter(Q(nombre__icontains=queryset), estado=True).values()
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
            escuela = Escuela.objects.filter(Q(nombre__iexact=nombre_escuela_form), estado=True).values("nombre")
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
    escuela = Escuela.objects.get(idEscuela=id)
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
    escuela=Escuela.objects.get(idEscuela=id)
    escuela.estado = False
    escuela.save()
    return redirect("listarescuela")


def listarNoticia(request):
    queryset = request.GET.get("buscar")
    noticia = Noticia.objects.filter(estado=True).order_by('-idNoticia').values()
    if queryset:
        noticia = Noticia.objects.filter(Q(titulo__icontains=queryset) | Q(descripcion__icontains=queryset), estado=True).values()
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
            noticia = Noticia.objects.filter(Q(titulo__iexact=titulo_noticia_form), estado=True).values("titulo")
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
    noticia = Noticia.objects.get(idNoticia=id)
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
    noticia=Noticia.objects.get(idNoticia=id)
    noticia.estado = False
    noticia.save()
    return redirect("listarnoticia")
