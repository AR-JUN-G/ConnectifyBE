Inbox API:(Chat Listing)
/api/direct/chats: Return list of chats for the loggedin User
/api/direct/friends/available-for-chat: Return list of users i am frnd with but i havent made a chat

Message: (Exchanging the Message between User and Group)
/api/direct/:toUserID: => I need to send all the data/message Send between toUser and FromUser




Socket.io: -> It is an abstraction layer over engine.io

    socket -> Like Represent Every individual Person if the login from different devices all the devices
              have unique socketId with from same person
    
    Room -> socket can make a subscription to a room where user can receive message/inform if any other 
            user send message target that room

    nameSpace -> Different building in the city. Example One can target Direct chat and other can handle 
                    group message if one fails other one will prevail


    io -> Its like the entire city.  
