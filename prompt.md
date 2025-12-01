
I am working on an AI project and concept and I have this idea (below).

I want to show how AI can decide the the UI interface on fly based on users preferences.


# MY IDEA
Future - Amy Becomes The User Experience

I mentioned in my previous email that Amy can be much larger than a support layer.

An intelligence that knows our system is in the best position to develop the next product for us. It just needs skills (LLMs will bring plenty of skills to our Amy). BUT If Amy can guide our clients, why not have it replace our UI altogether? We keep saying our UI is not "optimal/modern/user-friendly"—honestly, no UI truly is, not even static ones done by AI. We need Dynamic AI Designs.

The client comes and starts the conversation; it is the AI that derives the UI.

We want to explore this idea first with low risk in our new Developers API, and then expand this to our trading platform to replace our legacy V2 platform. This can be our differentiator from competitors and a unique advantage we have because of our early focus on AI.

I have attached some screenshots (generated concepts) to visualize the idea better.


# Need your help
I want you to create a POC UI with some component. We need to be modular. also a backend service.
The backend is an LLM driven service that can chat with the client and return both rpely to the user and also clue for the UI to rearrange or add and remove UI component. We should be able to control them in frontend I assume.

note we do not need to change the UI on every interaction. The current setup, colors, dark or light or other factors can be stored in Frontend in a session or cookie or something. But our service and the AI has the ability to influence it based on interaction with the user. Also maybe a good exampel to add language/transation abilities as part of UI customizations! Also why not showing the clock or not. But AI should be able to reason about the latest laytout and tries to optimize it for the user.

service in Python, if you know how use openai as the LLM. frontend I will leave it to you.
Eventually I want to be able to start one sginle docker or docker compose and simply go to a local web page and test the idea

What UI? I am not sure, this is a POC I want to show so maybe a dummy trading website? or something else that users benefit from UI customized by AI.


## Floating Chat

Can you make the chat hover instead of occupying one side of the page?


## Layout Cleanup

When I ask AI to close a component like Portfolio, the component besides it stays the same side so I see an empty space there. How can I clean that up?

# Extra thoughts
This demo will be for deriv.com and it would be great if we create the UI using https://api.deriv.com/. Are you familiar with the API?
I was thinking impact will be more clear if we create a working demo based on that. 
I can create an API token in my deriv profile for the app. Clients can do the same and our app can work on that token for trading.

Please use the deriv api and use this image, images/shot1.png as the guilde of what we want to build for our POC.
