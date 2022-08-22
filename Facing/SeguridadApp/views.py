from django.shortcuts import redirect,render
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate,login,logout 
from django.contrib import messages 
from carrerasApp.models import *
from django.db.models import Q

# Create your views here.

def home(request):
    escuela = Escuelas.objects.filter(estado=True).order_by('nombre')
    context = {'escuela':escuela}
    return render(request,'inicio.html',context)

def faq(request):
    escuela = Escuelas.objects.filter(estado=True).order_by('nombre')
    context = {'escuela':escuela}
    return render(request,'nosotros/faq.html',context)

def subir(request):
    return render(request,'nosotros/subir.html')

def mvision(request):
    escuela = Escuelas.objects.filter(estado=True).order_by('nombre')
    context = {'escuela':escuela}
    return render(request,'nosotros/MVision.html',context)

def organigrama(request):
    escuela = Escuelas.objects.filter(estado=True).order_by('nombre')
    context = {'escuela':escuela}
    return render(request,'nosotros/organigrama.html',context)

def reseñaH(request):
    escuela = Escuelas.objects.filter(estado=True).order_by('nombre')
    context = {'escuela':escuela}
    return render(request,'nosotros/reseñahistorica.html',context)

def acceder(request):
    return render(request,'login.html')

def acceder(request): 
    if request.method=="POST":
        form=AuthenticationForm(request,data=request.POST)
        if form.is_valid():
            nombre_usuario=form.cleaned_data.get("username")
            password=form.cleaned_data.get("password")
            usuario=authenticate(username=nombre_usuario,password=password)
            if usuario is not None:
                login(request,usuario)
                return redirect("home")
            else: 
                messages.error(request,"Los datos son incorrectos")
        else:
            messages.error(request,"Los datos son incorrectos") 
    form=AuthenticationForm() 
    return render(request,"login.html",{"form":form})

def salir(request): 
    logout(request)
    messages.info(request,"Saliste exitosamente")
    return redirect("home")

def curriculaCarrera(request,slug):
    escuela = Escuelas.objects.filter(estado=True).order_by('nombre')
    nombreEscuela = Escuelas.objects.filter(Q(slug__iexact=slug)).values("nombre").first()
    idEscuela = Escuelas.objects.filter(Q(slug__iexact=slug)).values("idescuela").first()
    curricula = Curriculas.objects.filter(Q(idescuela_id=idEscuela['idescuela']), estado=True).order_by('idciclo_id')
    context = {'curricula':curricula, 'nombreEscuela':nombreEscuela['nombre'],'escuela':escuela}
    return render(request,"carreras/curricula.html",context)
