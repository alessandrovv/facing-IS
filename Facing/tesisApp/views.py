from django.shortcuts import render

from tesisApp.models import Tesis
from carrerasApp.models import *

# Create your views here.
escuelas=Escuelas.objects.all()
# Create your views here.
def muestratesis(request):
    tesis = Tesis.objects.order_by('-id').values()
    context = {'tesis':tesis,'escuelas':escuelas}
    return render(request,"tesis.html",context)