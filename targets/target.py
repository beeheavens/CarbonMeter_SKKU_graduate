
from codecarbon import track_emissions

@track_emissions()
def my_function():
    for i in range(100000):
        print(i)

my_function()
    