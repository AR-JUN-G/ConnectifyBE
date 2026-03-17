Chat Feature
    1. User can chat with persons whom they have connected with
    2. Send Message
    3. Receive Message
    4. Get Notification 


From my understanding How Socket works
Schema Should be Like:
    PrivateChatSchema
        RoomID:objectID
        UserA:
        UserB:
    Messages:
        Each messages should be different Document 
    
1. Consider 2 user in our application UserA and UserB
2. To make Communication between UserA and UserB
    Assume UserA is Trying to Make/Send Message to UserB
        I need to check whether UserA and UserB are frnds
            Yes ->
                1. Check if the Room already Exists between UserA and UserB
                2. If Yes -> Dont Create a Room
                3. If No -> Create a Room
                4. If user send Message I need to store them

            No -> He cant able to make Connection