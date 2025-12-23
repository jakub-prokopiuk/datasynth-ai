from faker import Faker
from typing import List, Dict, Any
from models import GeneratorRequest
import os
from openai import OpenAI
import random

class DataEngine:
    def __init__(self):
        self.faker = Faker()
        self.client = OpenAI()

    def _generate_faker_value(self, params: Dict[str, Any]) -> Any:
        """
        Generates a value using the Faker library.
        """
        method_name = params.get("method")
        if not method_name:
            return None
            
        if not hasattr(self.faker, method_name):
            return f"Error: Faker method '{method_name}' not found"

        faker_method = getattr(self.faker, method_name)
        kwargs = params.get("kwargs", {})

        try:
            return faker_method(**kwargs)
        except Exception as e:
            return f"Error executing {method_name}: {str(e)}"

    def _generate_distribution_value(self, params: Dict[str, Any]) -> Any:
        """
        Generates a value based on a weighted distribution.
        Requires 'options' (list of values) and 'weights' (list of numbers).
        """
        options = params.get("options")
        weights = params.get("weights")

        if not options or not isinstance(options, list):
            return "Error: 'options' list is required for distribution"

        if not weights:
            return random.choice(options)

        if len(options) != len(weights):
            return "Error: Length of 'options' and 'weights' must match"

        try:
            return random.choices(options, weights=weights, k=1)[0]
        except Exception as e:
            return f"Error in distribution: {str(e)}"

    def _generate_llm_value(self, params: Dict[str, Any], current_row_context: Dict[str, Any]) -> str:
            """
            Generates a value using an LLM based on the provided prompt template and context.
            """
            model = params.get("model", "gpt-4o-mini")
            template = params.get("prompt_template", "")
            temperature = params.get("temperature", 1.0)

            if not template:
                return "Error: No prompt_template provided"

            try:
                formatted_prompt = template.format(**current_row_context)
            except KeyError as e:
                return f"Error: Missing dependency field {e} for prompt template"
            except Exception as e:
                return f"Error formatting prompt: {str(e)}"

            try:
                system_instruction = (
                    "You are a raw data generator backend. "
                    "Your task is to generate ONE single value based on the user prompt. "
                    "Do NOT add any explanations, markdown formatting, quotes, or introductory text. "
                    "Output ONLY the value itself."
                )

                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": formatted_prompt}
                    ],
                    temperature=temperature,
                    max_tokens=50
                )
                
                return response.choices[0].message.content.strip().strip('"')
                
            except Exception as e:
                return f"OpenAI Error: {str(e)}"

    def generate(self, request: GeneratorRequest) -> List[Dict[str, Any]]:
        results = []

        for _ in range(request.config.rows_count):
            row_data = {}
            
            if request.config.global_context:
                row_data["global_context"] = request.config.global_context

            for field in request.schema_structure:
                if field.type == "faker":
                    row_data[field.name] = self._generate_faker_value(field.params)
                
                elif field.type == "llm":
                    row_data[field.name] = self._generate_llm_value(field.params, row_data)
                
                elif field.type == "distribution":
                    row_data[field.name] = self._generate_distribution_value(field.params)
                
                else:
                    row_data[field.name] = None
            
            if "global_context" in row_data:
                del row_data["global_context"]

            results.append(row_data)

        return results