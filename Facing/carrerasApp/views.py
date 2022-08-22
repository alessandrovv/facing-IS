from django.shortcuts import render

from carrerasApp.models import *
# Create your views here.
escuelas=Escuelas.objects.all()
def listardocentes(request,id):
    gradosDoc = []
    expLab = []
    escuela= Escuelas.objects.get(idescuela = id)
    docentes = Docentes.objects.filter(idEscuela=id)
    #grados = Grado_docente.objects.filter(iddocente__idescuela=id)
    for Idoc in docentes:
        grados =Grado_docente.objects.filter(iddocente_id = Idoc.idDocente) 
        exp = Exp_lab.objects.filter(iddocente_id = Idoc.idDocente)
        gradosDoc.append(grados)
        expLab.append(exp)
    context = {'grados':gradosDoc,'docentes':docentes,'expLab':expLab,'escuelas':escuelas,'escuela':escuela}
    return render(request,"planadocente.html",context) 

