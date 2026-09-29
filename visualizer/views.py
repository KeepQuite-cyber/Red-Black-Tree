from django.shortcuts import render

def home(request):
    return render(request, "visualizer/index.html")
