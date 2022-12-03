from tkinter import filedialog
from tkinter import simpledialog
from tkinter import *
import json

root = Tk()
root.title("4koneko Map Editor")
root.geometry("700x700")
root.resizable(False, False)

# Create a menu bar
menu = Menu(root)
root.config(menu=menu)
def interpret(data):
    print(data)

# function that generates fake map data for every second and half second in json with length of length (in seconds) and in every lane (seconds, lane, speed)
# returns json
def generate_fake_map_data(length):
    data = []
    for i in range(length * 2):
        for lane in range(4):
            data.append({"seconds": i / 2, "lane": lane, "speed": 1})
    return data



class Project:
    def __init__(self, data, name):
        self.data = data
        self.height = self.data["totalSeconds"] * 100
        self.name = name
        self.menu = Menu(menu, tearoff=0)
        self.menu.add_command(label="Save", command=self.save)
        self.menu.add_command(label="View mode", command=self.viewmode)
        self.menu.add_command(label="Edit mode", command=self.editmode)
        self.menu.add_command(label="Set Seconds", command=self.setseconds)
        self.frame = Frame(root, width=700, height=self.height)
        self.frame.pack(expand=True, fill=BOTH)
        self.canvas = Canvas(self.frame, bg='#F0F0F0', width=700, height=self.height, scrollregion=(0, 0, 1000, self.height))
        self.vbar = Scrollbar(self.frame, orient=VERTICAL)
        self.vbar.pack(side=RIGHT, fill=Y)
        self.vbar.config(command=self.canvas.yview)
        self.canvas.config(width=700, height=self.height)
        self.canvas.config(yscrollcommand=self.vbar.set)
        self.canvas.pack(side=LEFT, expand=True, fill=BOTH)
        # bind the mouse wheel to the canvas
        self.canvas.bind_all("<MouseWheel>", lambda event: self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units"))
        self.viewmode()
    
    
    def clearcanvas(self):
        self.canvas.delete("all")

    def save(self):
        with open(self.name + ".map.json", "w") as f:
            json.dump(self.data, f)

    def setseconds(self):
        self.data["totalSeconds"] = simpledialog.askinteger("Set Seconds", "How many seconds do you want?")
        self.height = self.data["totalSeconds"] * 100
        self.frame.config(height=self.height)
        self.canvas.config(height=self.height, scrollregion=(0, 0, 1000, self.height))
        self.vbar.config(command=self.canvas.yview)
        self.canvas.config(yscrollcommand=self.vbar.set)
        self.canvas.pack(side=LEFT, expand=True, fill=BOTH)
        self.editmode()

    def edit(self, obj):
        print(obj)
        cobj = {"seconds": obj["seconds"], "lane": obj["lane"]}
        cdata = []
        for i in self.data["data"]:
            cdata.append({"seconds": i["seconds"], "lane": i["lane"]})
        if cobj in cdata:
            # get cobj index in cdata
            index = cdata.index(cobj)
            # in self.data["data"], remove the object at index
            self.data["data"].pop(index)
        obj["speed"] = simpledialog.askinteger("Set Speed", "What speed do you want?")
        if obj["speed"] == 0:
            obj["speed"] = 1
        self.data["data"].append(obj)
        self.editmode()

    def viewmode(self):
        self.clearcanvas()
        # for every object in the data, draw it
        for obj in self.data["data"]:
            lane = obj["lane"]
            speed = obj["speed"]
            seconds = obj["seconds"]
            # calculate the x and y coordinates
            x = lane * 125
            y = seconds * 125
            # calculate the width and height
            w = 125
            h = 125
            self.canvas.tag_bind(self.canvas.create_rectangle(x, y, x + w, y + h, fill="#B5B5B5"), "<Button-1>", lambda event, obj=obj: edit(obj))
    
    def makeorbreak(self, obj):
        cobj = {"seconds": obj["seconds"], "lane": obj["lane"]}
        cdata = []
        for i in self.data["data"]:
            cdata.append({"seconds": i["seconds"], "lane": i["lane"]})
        if cobj in cdata:
            # get cobj index in cdata
            index = cdata.index(cobj)
            # in self.data["data"], remove the object at index
            self.data["data"].pop(index)
        else:
            self.data["data"].append(obj)
        self.editmode()

    def showinfo(self, obj):
        if self.tooltips:
            self.canvas.create_text(obj["lane"] * 125 + 62.5, obj["seconds"] * 125 + 62.5, text="lane: " + str(obj["lane"]) + " speed: " + str(obj["speed"]) + " seconds: " + str(obj["seconds"]), fill="#000000", font=("Arial", 10))   

    def hideinfo(self, obj):
        if self.tooltips:
            self.canvas.delete("all")
            self.editmode()

    def editmode(self):
        self.clearcanvas()
        tempdata = generate_fake_map_data(self.data["totalSeconds"])
        for obj in tempdata:
            lane = obj["lane"]
            speed = obj["speed"]
            seconds = obj["seconds"]
            # calculate the x and y coordinates
            x = lane * 125
            y = seconds * 125
            # calculate the width and height
            w = 125
            h = 125
            # check if the object is in the data, ignoring speed attribute
            cobj = {"seconds": obj["seconds"], "lane": obj["lane"]}
            cdata = []
            for i in self.data["data"]:
                cdata.append({"seconds": i["seconds"], "lane": i["lane"]})
            if cobj in cdata:
                self.canvas.tag_bind(self.canvas.create_rectangle(x, y, x + w, y + h, fill="#B5B5B5"), "<Button-1>", lambda event, obj=obj: self.makeorbreak(obj))
                # on right click, call self.edit(obj)
                self.canvas.tag_bind(self.canvas.create_rectangle(x, y, x + w, y + h, fill="#B5B5B5"), "<Button-3>", lambda event, obj=obj: self.edit(obj))
            else:
                self.canvas.tag_bind(self.canvas.create_rectangle(x, y, x + w, y + h, fill="#E8E8E8"), "<Button-1>", lambda event, obj=obj: self.makeorbreak(obj))
    
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
    fp.write("{\"totalSeconds\": 0, \"data\":[]}")
    fp.close()
    internal_project_init("{\"totalSeconds\": 0, \"data\":[]}", project_name)

def load_project():
    # open file picker dialog
    filetypes = (
    ('4koneko map files', '*.map.json'),
    ('All files', '*.*')
    )
    # show the open file dialog
    f = filedialog.askopenfile(filetypes=filetypes)
    name = f.name
    # split fname at last /
    name = name.split("/")[-1]
    # split fname at .
    name = name.split(".")[0]
    internal_project_init(f.read(), name)

def internal_project_init(raw, name):
    # parse json
    data = json.loads(raw)
    # create a new project
    project = Project(data, name)
    # add project to menu
    menu.add_cascade(label=project.name, menu=project.menu)

# Create a menu item
file_menu = Menu(menu, tearoff=0)

menu.add_cascade(label="File", menu=file_menu)
file_menu.add_command(label="New Project...", command=new_project)
file_menu.add_command(label="Load", command=load_project)
file_menu.add_command(label="Exit", command=root.quit)
root.mainloop()