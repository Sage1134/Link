from pymongo import MongoClient
from dotenv import load_dotenv
import os
import asyncio
import json
import hashlib
import  uuid
import websockets
from gensim.models import Word2Vec

matchModel = Word2Vec.load("matchModel/matchModel.model")

def determineSimilarity(w1, w2):
    try:
        return matchModel.wv.similarity(w1=w1, w2=w2)
    except:
        return 0.25

def calculateMatchScore(partyA, partyB):
    matchScores = []
    for i in partyA:
        currentTermScores = []
        for j in partyB:
            currentTermScores.append(determineSimilarity(i, j))
        if len(currentTermScores) > 0:
            matchScores.append(max(currentTermScores))
    if len(matchScores) == 0:
        return 0
    return min((sum(matchScores) / len(matchScores)) * 1.15, 1)

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
        elif data["purpose"] == "joinCommunity":
            await joinCommunity(client_socket, data)
        elif data["purpose"] == "createCommunity":
            await createCommunity(client_socket, data)
        elif data["purpose"] == "getUserCommunities":
            await getUserCommunities(client_socket, data)
        elif data["purpose"] == "getCommunityExtracurriculars":
            await getCommunityExtracurriculars(client_socket, data)
        elif data["purpose"] == "createPost":
            await createPost(client_socket, data)
        elif data["purpose"] == "signOut":
            await signOut(client_socket, data)
        elif data["purpose"] == "addTag":
            await addTag(client_socket, data)
        elif data["purpose"] == "getUserTags":
            await getUserTags(client_socket, data)
        elif data["purpose"] == "deleteTag":
            await deleteTag(client_socket, data)
    except:
        pass

async def deleteTag(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        tag = data["tag"].strip()
        
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                tags = getData(["profileTags", username])
                if tags == None:
                    tags = []
                if tag in tags:
                    tags.remove(tag)
                
                setData(["profileTags", username], tags)
                
                data = {"purpose": "deleteSuccess"}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def getUserTags(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                tags = getData(["profileTags", username])
                if tags == None:
                    tags = []
                data = {"purpose": "fetchSuccess",
                        "tags": tags}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def addTag(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        tag = data["tag"].strip()
        
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                currentTags = getData(["profileTags", username])
                if currentTags == None:
                    currentTags = []

                if len(tag) >= 1:
                    if tag not in currentTags:
                        currentTags.append(tag)
                        setData(["profileTags", username], currentTags)
                        
                data = {"purpose": "tagAddSuccess"}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def signOut(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]

        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                del sessionTokens[username]
                data = {"purpose": "signOutSuccess"}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def getCommunityExtracurriculars(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                extracurriculars = getData(["communities", data["communityCode"], "extracurriculars"])
                if extracurriculars == None:
                    extracurriculars = []
                
                data = {"purpose": "fetchSuccess",
                        "extracurriculars": extracurriculars}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def createPost(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        communityCode = data["communityCode"]
        title = data["postTitle"]
        description = data["postDescription"]
        tags = data["tags"]
        
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                currentPosts = getData(["communities", communityCode, "extracurriculars"])
                if currentPosts is None:
                    currentPosts = []
                
                post = {"title": title, "description": description, "tags": tags}
               
                currentPosts.append(post)
                
                setData(["communities", communityCode, "extracurriculars"], currentPosts)
                
                data = {"purpose": "postSuccess"}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except Exception as e:
        pass
    finally:
        connectedClients.remove(client_socket)


async def getUserCommunities(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                joinedCommunities = []
                communities = getData(["communities"])
                userCommunities = getData(["joinedCommunities", username])
                
                if communities == None:
                    communities = {}
                
                if userCommunities == None:
                    userCommunities = []
                
                for i in userCommunities:
                    if i in communities.keys():
                        joinedCommunities.append(communities[i]["data"])
                
                data = {"purpose": "fetchSuccess",
                        "communities": joinedCommunities}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def createCommunity(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                communityCode = str(uuid.uuid4())
                community = dict()
                
                community["data"] = {}
                cData = community["data"]
                cData["communityName"] = data["communityName"]
                cData["communityCode"] = communityCode
                
                setData(["communities", communityCode], community)
                
                currentCommunities = getData(["joinedCommunities", username])
                if currentCommunities is None:
                    currentCommunities = []
                    
                currentCommunities.append(communityCode)
                setData(["joinedCommunities", username], currentCommunities)

                data = {"purpose": "createSuccess"}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)

async def joinCommunity(client_socket, data):
    try:
        sessionID = data["sessionToken"]
        username = data["username"]
        if username in sessionTokens.keys():
            if sessionTokens[username] == sessionID:
                community = getData(["communities"])
                communityCode = data["communityCode"]
                
                if community == None:
                    community = {}
            
                if communityCode in community.keys():
                    currentCommunities = getData(["joinedCommunities",  username])
                    if currentCommunities == None:
                        currentCommunities = []
                    if communityCode not in currentCommunities:
                        currentCommunities.append(communityCode)
                        setData(["joinedCommunities", username], currentCommunities)
                        data = {"purpose": "joinSuccess"}
                    else:
                        data = {"purpose": "alreadyJoined"}
                else:
                    data = {"purpose": "communityNotFound"}
            else:
                data = {"purpose": "fail"}
        else:
            data = {"purpose": "fail"}
        await client_socket.send(json.dumps(data))
    except:
        pass
    finally:
        connectedClients.remove(client_socket)


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