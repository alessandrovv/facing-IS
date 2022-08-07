from django.shortcuts import render

# Create your views here.

def home(request):
    return render(request,'inicio.html')

def mvision(request):
    return render(request,'nosotros/MVision.html')

def organigrama(request):
    return render(request,'nosotros/organigrama.html')

def reseñaH(request):
    return render(request,'nosotros/reseñahistorica.html')

def acceder(request):
    return render(request,'login.html')
