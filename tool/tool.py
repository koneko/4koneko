from tkinter import filedialog
from tkinter import simpledialog
from tkinter import *
import base64 
import json

root = Tk()
root.title("Mapping Tool")
root.geometry("550x700")
root.resizable(False, False)

# Create a menu bar
menu = Menu(root)
root.config(menu=menu)

# function that generates fake map data for every second and half second in json with length of length (in seconds) and in every lane (seconds, lane, speed)
# returns json
def generate_fake_map_data(length, speed):
    data = []
    for i in range(length * 2):
        for lane in range(4):
            data.append({"seconds": i / 2, "lane": lane, "speed": speed})
    return data

# json data to base64
def json_to_base64(data):
    return base64.b64encode(json.dumps(data).encode("utf-8")).decode("utf-8")

class Project:
    def __init__(self, data, name, path):
        self.data = data
        self.height = self.data["totalSeconds"] * 125
        self.name = name
        self.path = path
        if self.path == None:
            self.path = "./" + self.name + ".map.json"
        self.menu = Menu(menu, tearoff=0)
        self.menu.add_command(label="Save", command=self.save)
        self.menu.add_command(label="Close", command=self.close)
        self.menu.add_command(label="View mode", command=self.viewmode)
        self.menu.add_command(label="Edit mode", command=self.editmode)
        self.extras = Menu(self.menu, tearoff=0)
        self.extras.add_command(label="Export to Base64", command=self.export)
        self.extras.add_command(label="Custom Note", command=self.customnote)
        self.extras.add_command(label="Set Seconds", command=self.setseconds)
        self.extras.add_command(label="Set Default speed", command=self.setspeed)
        self.menu.add_cascade(label="Extras", menu=self.extras)
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

    def close(self):
        self.frame.destroy()
        menu.delete("Project")
        # enable file menu
        menu.entryconfig("File", state=NORMAL)

    def setspeed(self):
        self.data["defaultSpeed"] = simpledialog.askinteger("Set Default Speed", "What speed do you want?")
        self.editmode()

    def export(self):
        b64 = json_to_base64(self.data["data"])
        print(b64)

    def customnote(self):
        seconds = simpledialog.askfloat("Custom Note", "When do you want the note?")
        if seconds == None:
            seconds = 0.0
        lane = simpledialog.askinteger("Custom Note", "Where do you want the note?")
        if lane == None:
            lane = 0
        speed = simpledialog.askinteger("Custom Note", "How fast do you want the note?")
        if speed == None:
           speed = 1
        # add to data
        self.data["data"].append({"seconds": seconds, "lane": lane, "speed": speed})                     

    def showinfo(self,obj):
        # calculate the x and y coordinates
        x = obj["lane"] * 125
        y = obj["seconds"] * 125
        # calculate the width and height
        w = 125
        h = 125
        self.canvas.create_text(x + w / 2, y + h / 2, text="Speed: " + str(obj["speed"]))

    def hideinfo(self, obj):
        self.clearcanvas()
        self.viewmode()

    def clearcanvas(self):
        self.canvas.delete("all")

    def save(self):
        with open(self.path, "w") as f:
            json.dump(self.data, f)

    def setseconds(self):
        self.data["totalSeconds"] = simpledialog.askinteger("Set Seconds", "How many seconds do you want?")
        self.height = self.data["totalSeconds"] * 125
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
        # get cobj index in cdata
        index = cdata.index(cobj)
        # in self.data["data"], remove the object at index
        self.data["data"].pop(index)
        tspeed = simpledialog.askinteger("Set Speed", "What speed do you want?")
        if tspeed == None:
            tspeed = 1
        obj["speed"] = tspeed 
        
        if obj["speed"] <= 0:
            obj["speed"] = 1
        self.data["data"].append(obj)
        self.viewmode()

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
            h = 125 / 2
            self.canvas.tag_bind(self.canvas.create_rectangle(x, y, x + w, y + h, fill="#B5B5B5"), "<Button-1>", lambda event, obj=obj: self.edit(obj))
            # create a text object in the middle of the rectangle with the speed, white color, impact font, black border    

            self.canvas.tag_bind(self.canvas.create_text(x + w / 2, y + h / 2, text="Speed: " + str(speed) + "\nSeconds: " + str(seconds)), "<Button-1>", lambda event, obj=obj: self.edit(obj))
    
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

    def editmode(self):
        self.clearcanvas()
        tempdata = generate_fake_map_data(self.data["totalSeconds"], self.data["defaultSpeed"])
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
    fp.write("{\"totalSeconds\": 0,\"defaultSpeed\": 1, \"data\":[]}")
    fp.close()
    internal_project_init("{\"totalSeconds\": 0,\"defaultSpeed\": 1, \"data\":[]}", project_name)

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
    internal_project_init(f.read(), name, f.name)

def internal_project_init(raw, name, path=None):
    # parse json
    data = json.loads(raw)
    # create a new project
    project = Project(data, name, path)
    # add project to menu
    menu.add_cascade(label="Project", menu=project.menu)
    # disable new project button and load project button
    menu.entryconfig(0, state=DISABLED)
    menu.entryconfig(1, state=DISABLED)


# Create a menu item
file_menu = Menu(menu, tearoff=0)

menu.add_cascade(label="File", menu=file_menu)
file_menu.add_command(label="New Project", command=new_project)
file_menu.add_command(label="Load", command=load_project)
file_menu.add_command(label="Exit", command=root.quit)
root.mainloop()