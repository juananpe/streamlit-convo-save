from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import together
import streamlit as st
import os
from dotenv import load_dotenv

load_dotenv()

st.title("AI Chat")

# API Selection
api_option = st.selectbox('Choose your AI provider', ['Mistral', 'TogetherAI'])


# Function to reset the state
def reset_state():
    for key in st.session_state:
        del st.session_state[key]

# Get the API key from the environment variables or the user
mistral_api_key = os.getenv("MISTRAL_API_KEY")
together_api_key = os.getenv("TOGETHER_API_KEY")

if not mistral_api_key:
    if "api_key" not in st.session_state:
        st.session_state["api_key"] = st.text_input("Enter your API key", type="password")
    mistral_api_key = st.session_state["api_key"]
else:
    if expected_password := os.getenv("PASSWORD"):
        password = st.text_input("What's the secret password?", type="password")
        # Check if the entered key matches the expected password
        if password != expected_password:
            mistral_api_key = ''
            st.error("Unauthorized access.")
            reset_state()  # This line will reset the script
        else:
            mistral_api_key = os.getenv("MISTRAL_API_KEY")
            

# Authentication and model selection for Mistral
if api_option == 'Mistral':
    if mistral_api_key:
        client = MistralClient(api_key=mistral_api_key)
        model_options = ('mistral-tiny', 'mistral-small', 'mistral-medium')
        st.session_state["mistral_model"] = st.selectbox('Select a Mistral model', model_options)
    else:
        st.error("Mistral API key not found.")
        reset_state()

# Authentication for Llama (Together.ai)
elif api_option == 'TogetherAI':
    if together_api_key:
        together.api_key = together_api_key
        model_list = together.Models.list()
        model_names = [model_dict['name'] for model_dict in model_list]
        st.session_state["llama_model"] = st.selectbox('Select a TogetherAI model', model_names)
    else:
        st.error("TogetherAI API key not found.")
        reset_state()

# Initialize the model in session state if it's not already set
if "mistral_model" not in st.session_state:
    st.session_state["mistral_model"] = 'mistral-medium'

# Always display the dropdown
# model_options = ('mistral-tiny', 'mistral-small', 'mistral-medium')
# st.session_state["mistral_model"] = st.selectbox('Select a model', model_options, index=model_options.index(st.session_state["mistral_model"]), key="model_select")

# Add system prompt input
if "system_prompt" not in st.session_state:
    st.session_state["system_prompt"] = 'You are a helpful software engineering assistant'
st.text_input('System Prompt', key="system_prompt")

if "messages" not in st.session_state:
    st.session_state.messages = []

# Add system prompt as a ChatMessage if it doesn't exist
if st.session_state["system_prompt"] and not any(message.role == "system" for message in st.session_state.messages):
    st.session_state.messages.insert(0, ChatMessage(role="system", content=st.session_state["system_prompt"]))

for message in st.session_state.messages:
    if message.role != "system":  # Skip system messages for UI
        with st.chat_message(message.role):  # Use dot notation here
            st.markdown(message.content)  # And here

if prompt := st.chat_input("What is up?"):
    new_message = ChatMessage(role="user", content=prompt)
    st.session_state.messages.append(new_message)
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""

        if api_option == 'Mistral':
            for response in client.chat_stream(
                model=st.session_state["mistral_model"],
                messages=st.session_state.messages,  # Pass the entire messages list
            ):
                full_response += (response.choices[0].delta.content or "")
                message_placeholder.markdown(full_response + "▌")
        
        elif api_option == 'TogetherAI':
            # console log the prompt
            print(f"<human>: {prompt}\n<bot>:")
            # console log model option
            print( st.session_state["llama_model"])

            # Llama processing
            output = together.Complete.create(
                prompt = f"<human>: {prompt}\n<bot>:", 
                model = st.session_state["llama_model"], 
                max_tokens = 256,
                temperature = 0.8,
                top_k = 60,
                top_p = 0.6,
                repetition_penalty = 1.1,
                stop = ['<human>', '\n\n']
            )
            full_response = output['output']['choices'][0]['text']

        message_placeholder.markdown(full_response)
    st.session_state.messages.append(ChatMessage(role="assistant", content=full_response))
