## Inspiration

On April 16, 2025 I received a photo text message of my older brother in a surgical mask, informing me that my nephew was coming into this world 6.5 weeks earlier than expected. Premature births happen sometimes, but this situation was a bit different, as my sister-in-law had a severe case of preeclampsia. She had gone to the hospital for a routine checkup that day and within hours the doctors determined she would need an emergency cesarean section.

My nephew, Anthony Charles Troiano, came into the world that night weighing 3 pounds and 7 ounces. My family and I understood he would need to stay in the NICU until he gained weight and was safe to come home, but we had no idea that the road ahead would be such a roller coaster. 

My nephew is still in the NICU - and, even though we all know we shouldn't do it - it's been close to impossible for my family and I to not search Google for answers these past few months. My older brother and I have always been close - we were inseparable growing up and he's still my best friend. I had some other cool projects ideas for this Hackathon when I found out about it, but with all this going on in my life, I really wanted to use these powerful and innovative AI tools at my disposal to build something that could help families going through similar situations. 

## What it does

Neomate is a compassionate AI-powered platform designed to provide therapeutic support and evidence-based information for families navigating neonatal hospitalization. Built with an empathetic and medically accurate AI, Neomate offers 24/7 support during one of life's most challenging journeys.

## How I built it

Writing careful, well-thought out prompts, I used [Bolt](https://bolt.new) to build Neomate in its' entirety. Bolt impressively helped me create a full-stack AI powered application with the tech stack listed below. Bolt was able capable of deploying my application to [Netlify]() and connecting it to the clever domain name I purchased from [IONOS]().

### Technologies

- **AI Companion**: [Bolt](https://bolt.new)
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Code Quality**: ESLint with TypeScript support
- **Database**: [Supabase](https://supabase.com/)
- **AI Text Chat**: [Chat GPT](https://chatgpt.com/)
- **Coversational Voice AI**: [ElevenLabs](https://elevenlabs.io/)

## Challenges I ran into

- Initially deploying Supabase edge functions was easy, but I ran into some issues after refactoring the Eleven Labs function and migrating.
- Upon setting up ChatGPT for additional text based chat support I had some trouble with the agent, which ultimately ending up being caused by a misspelt configuration variable that I found myself in Supabase the Edge function for 'openai'.

## Accomplishments that I'm proud of

- I traveled and worked a lot this month, so I'm glad I got to implement conversational AI, as I was worried I might not have time to get to this.
- Building the entire landing page and authentication system in a single Bolt prompt ** I was very impressed with Bolt's ability to generate the entire application's landing page layout, authentication system, and dashboard from a single prompt. Bolt was smart enough to write an array of possible answers and build a bot as a placeholder for AI agent integration.
- Being able to focus on building this with everything going on right now. I think I needed to put my energy into my work if I wanted to deliver a fully functional MVP, and I'm proud that I stuck with it.
- I'm proud of the clever domain name I thought of. I think it's easy to say, clever, and relevant to the topic. I'm glad I chose to purchase both neomate.io and neomate.app (it was a tough decision, so I grabbed both)

## What I learned

- I learned a lot about new innovative AI tools, like Bolt and ElevenLabs. 
- I learned a lot about Tailwind CSS
- I have never used Supabase, and I definitely learned a lot about how it works. Even though Bolt provided SQL code and helped configure the database on the backend of the app, I still had to go into Supabase's dashboard on several occasions to check logs. I ended up identifying problems in the Edge function that Bolt did not spot and fixing the app on several occasions. 

## What's next for Neomate
- Update user profile page
- Make app more accessible
- Add cute Neomate icon or 'mascot' as included below on landing page and to the live chat - Neomate will search on the computer (I don't want to break anything at this point in development phase)