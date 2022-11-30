from tkinter import filedialog
from tkinter import simpledialog
from tkinter import *
import json

root = Tk()
root.title("4koneko Map Editor")
root.geometry("500x500")

# Create a menu bar
menu = Menu(root)
root.config(menu=menu)
def interpret(data):
    print("hello")

class Project:
    def __init__(self, data):
        self.data = data
        self.name = "Project"
        self.menu = Menu(menu, tearoff=0)
        self.menu.add_command(label="Save", command=self.save)
        self.menu.add_command(label="Close", command=self.close)
        # create canvas
        self.canvas = Canvas(root, width=500, height=10000, bg="white")
        self.canvas.pack()
        # for every object in the data, draw it    
        self.canvas.create_rectangle(100, 0, 200, 100, fill="red", outline="black")
        for obj in self.data:
            lane = obj["lane"]
            speed = obj["speed"]
            seconds = obj["seconds"]

        
    def save(self):
        print("Save")

    def close(self):
        print("Close")

# function that gets called when new project is clicked
def new_project():
    # enter project name
    # ask string
    project_name = simpledialog.askstring("Project Name", "Enter project name", parent=root)
    if project_name is None:
        return
    # create file with project name
    fp = open(project_name + ".map.json", "w")
    # write default json
    fp.write("[]")
    fp.close()
    print("Created project " + project_name)
    internal_project_init("[]")

def load_project():
    # open file picker dialog
    filetypes = (
    ('4koneko map files', '*.map.json'),
    ('All files', '*.*')
    )
    # show the open file dialog
    f = filedialog.askopenfile(filetypes=filetypes)
    internal_project_init(f.read())

def internal_project_init(raw):
    # parse json
    data = json.loads(raw)
    # create a new project
    project = Project(data)
    # add project to menu
    menu.add_cascade(label=project.name, menu=project.menu)

# Create a menu item
file_menu = Menu(menu)

menu.add_cascade(label="File", menu=file_menu)
file_menu.add_command(label="New Project...", command=new_project)
file_menu.add_command(label="Load", command=load_project)
# file_menu.add_separator()
file_menu.add_command(label="Exit", command=root.quit)

v = Scrollbar(root, orient="vertical")
# from top to bottom
v.pack(side="right", fill="y")

root.mainloop()