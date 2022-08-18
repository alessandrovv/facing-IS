from django.shortcuts import redirect,render
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate,login,logout 
from django.contrib import messages 
from carrerasApp.models import Escuelas
from django.db.models import Q
# Create your views here.
escuelas=Escuelas.objects.all()
context={'escuelas':escuelas}

def home(request):
    return render(request,'inicio.html',context)

def faq(request):
    return render(request,'nosotros/faq.html',context)

def subir(request):
    return render(request,'nosotros/subir.html',context)

def mvision(request):
    return render(request,'nosotros/MVision.html',context)

def organigrama(request):
    return render(request,'nosotros/organigrama.html',context)

def reseñaH(request):
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