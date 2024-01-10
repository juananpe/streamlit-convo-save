import together
import os
from dotenv import load_dotenv
load_dotenv()

# set your API key from process env
together.api_key = os.getenv("TOGETHER_API_KEY")

# see available models
model_list = together.Models.list()

print(f"{len(model_list)} models available")

# print the first 10 models on the menu
model_names = [model_dict['name'] for model_dict in model_list]
print(model_names[:10])

# NousResearch/Nous-Hermes-Llama2-70b	
output = together.Complete.create(
  prompt = "<human>: What are Isaac Asimov's Three Laws of Robotics?\n<bot>:", 
  model = "NousResearch/Nous-Hermes-Llama2-70b", 
  max_tokens = 256,
  temperature = 0.8,
  top_k = 60,
  top_p = 0.6,
  repetition_penalty = 1.1,
  stop = ['<human>', '\n\n']
)

# print generated text
print(output['output']['choices'][0]['text'])