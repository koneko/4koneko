from tkinter import filedialog
from tkinter import simpledialog
from tkinter import *
import json

root = Tk()
root.title("Mapping Tool")
root.geometry("500x500")

# Create a menu bar
menu = Menu(root)
root.config(menu=menu)

class Project:
    def __init__(self, data):
        self.data = data
        self.name = "Project"
        self.menu = Menu(menu, tearoff=0)
        self.menu.add_command(label="Save", command=self.save)
        self.menu.add_command(label="Close", command=self.close)
        # create a grid
        self.grid = Frame(root)
        self.grid.pack(fill=BOTH, expand=1)
        # create a canvas
        self.canvas = Canvas(self.grid, width=500, height=500)
        self.canvas.pack(fill=BOTH, expand=1)
        # create a scrollbar
        self.scrollbar = Scrollbar(self.grid, orient=VERTICAL, command=self.canvas.yview)
        self.scrollbar.pack(side=RIGHT, fill=Y)
        # configure the canvas
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        self.canvas.bind('<Configure>', lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        # create a new frame
        self.frame = Frame(self.canvas)
        # add the new frame to a window in the canvas
        self.canvas.create_window((0, 0), window=self.frame, anchor="nw")
        #
        
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