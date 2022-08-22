from multiprocessing import context
import re
from socket import fromshare
from django.shortcuts import render,redirect,get_object_or_404,HttpResponseRedirect
import imp
from django.contrib import messages 
from carrerasApp.models import *
from django.db.models import Q
from django.core.paginator import Paginator
