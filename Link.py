from pymongo import MongoClient
from dotenv import load_dotenv
import os
import asyncio
import json
import hashlib
import  uuid
import websockets

sessionTokens = dict()

async def addSessionToken(username, token):
    sessionTokens[username] = token

    async def expireToken():
        await asyncio.sleep(86400)
        if username in sessionTokens.keys() and sessionTokens[username] == token:
            del sessionTokens[username]

    asyncio.create_task(expireToken())
    
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

connectedClients = set()
ip = os.environ.get("ServerIP")
port = os.environ.get("Port")

async def newClientConnected(client_socket):
    try:
        connectedClients.add(client_socket)
        data = await client_socket.recv()
        data = json.loads(data)
        
        if data["purpose"] == "registration":
            await register(client_socket, data)
        elif data["purpose"] == "signIn":
            await signIn(client_socket, data)
    except:
        pass





async def register(client_socket, data):
    try:
        username = data["username"]
        password = data["password"]

        if getData(["Credentials", username]) == None:
            hash_object = hashlib.sha256()
            hash_object.update(password.encode())
            hashed_password = hash_object.hexdigest()
            setData(["Credentials", username, "password"], hashed_password)
            
            data = {"purpose": "registerResult",
                    "result": "Registration Successful! Please Sign In."}
        else:
            data = {"purpose": "registerResult",
                    "result": "Username Already Taken!"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def signIn(client_socket, data):
    try:
        username = data["username"]
        password = data["password"]

        hash_object = hashlib.sha256()
        hash_object.update(password.encode())
        hashed_password = hash_object.hexdigest()
        
        if getData(["Credentials", username, "password"]) == hashed_password:
            sessionToken = str(uuid.uuid4())
            await addSessionToken(username, sessionToken)
            data = {"purpose": "success",
                "sessionToken": sessionToken,
                "redirect": "../dashboard/dashboard.html"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

ip, port = "10.0.0.138", 1134
async def startServer():
    print("Server Started")
    await websockets.serve(newClientConnected, ip, port)
    
event_loop = asyncio.get_event_loop()
event_loop.run_until_complete(startServer())
event_loop.run_forever()