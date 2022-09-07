import pyodbc 

conn = pyodbc.connect('Driver={SQL Server};'
                      'Server=OMEN314;'
                      'Database=kobe;'
                      'Trusted_Connection=yes;')
