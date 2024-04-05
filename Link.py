from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv("Vars.env")

uri = os.environ.get("MONGODB_URI")
client = MongoClient(uri)
database = client["Link"]
collection = database["LinkData"]

def getData(path):
    data = collection.find()

    for document in data:
        if document["_id"] == path[0]:
            data = document
            break
    else:
        return None

    for key in path:
        if key in data.keys():
            data = data[key]
        else:
            return None
        
    return data

def setData(path, data):
    newData = collection.find_one({"_id":path[0]})
    if newData != None:
        newData = dict(newData)
        dataUpdate = newData
        
        for key in enumerate(path):
            if key[0] != len(path) - 1:
                if key[1] in dataUpdate.keys():
                    if isinstance(dataUpdate[key[1]], dict):
                        dataUpdate = dataUpdate[key[1]]
                    else:
                        dataUpdate[key[1]] = {}
                        dataUpdate = dataUpdate[key[1]]
                else:
                    dataUpdate[key[1]] = {}
                    dataUpdate = dataUpdate[key[1]]
        dataUpdate[path[-1]] = data
        collection.find_one_and_replace({"_id":path[0]}, newData)

    else:
        newData = {}
        dataUpdate = newData
        
        for key in enumerate(path):
            dataUpdate[key[1]] = {}
            if (key[0] != len(path) - 1):
                dataUpdate = dataUpdate[key[1]]
        dataUpdate[path[-1]] = data

        newData["_id"] = path[0]
        collection.insert_one(newData)

def delData(path):
    data = collection.find()

    target = path.pop()

    for document in data:
        if len(path) != 0:
            if document["_id"] == path[0]:
                doc = document
                data = doc
                for key in path:
                    if key in data.keys():
                        data = data[key]
                if target in data.keys():
                    del data[target]
                
                collection.find_one_and_replace({"_id":path[0]}, doc)
                break
        else:
            collection.delete_one({"_id":target})