from django.shortcuts import render

from tesisApp.models import Tesis

# Create your views here.
def muestratesis(request):
    tesis = Tesis.objects.order_by('-id').values()
    context = {'tesis':tesis}
    return render(request,"tesis.html",context)