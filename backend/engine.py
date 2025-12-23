from faker import Faker
from typing import List, Dict, Any, Set
from models import GeneratorRequest
from openai import OpenAI
import random

class DataEngine:
    def __init__(self):
        self.faker = Faker()
        self.client = OpenAI() 

    def _generate_faker_value(self, params: Dict[str, Any]) -> Any:
        method_name = params.get("method")
        if not method_name: return None
        if not hasattr(self.faker, method_name): return f"Error: Faker method '{method_name}' not found"
        faker_method = getattr(self.faker, method_name)
        kwargs = params.get("kwargs", {})
        try:
            return faker_method(**kwargs)
        except Exception as e:
            return f"Error: {str(e)}"

    def _generate_distribution_value(self, params: Dict[str, Any]) -> Any:
        options = params.get("options")
        weights = params.get("weights")
        if not options or not isinstance(options, list): return "Error: options required"
        if not weights: return random.choice(options)
        if len(options) != len(weights): return "Error: options/weights mismatch"
        try:
            return random.choices(options, weights=weights, k=1)[0]
        except Exception as e:
            return f"Error: {str(e)}"

    def _generate_foreign_key_value(self, params: Dict[str, Any], all_generated_data: Dict[str, List[Dict[str, Any]]]) -> Any:
        target_table_id = params.get("table_id")
        target_column = params.get("column_name")

        if not target_table_id or not target_column:
            return "Error: FK missing table_id or column_name"

        if target_table_id not in all_generated_data:
            return f"Error: Table {target_table_id} not generated yet (dependency error)"
        
        source_rows = all_generated_data[target_table_id]
        if not source_rows:
            return "Error: Source table empty"

        random_row = random.choice(source_rows)
        return random_row.get(target_column, "Error: Column not found")

    def _generate_llm_value(self, params: Dict[str, Any], current_row_context: Dict[str, Any], avoid_values: Set[str] = None, retry_count: int = 0) -> str:
        model = params.get("model", "gpt-4o-mini")
        template = params.get("prompt_template", "")
        
        base_temp = params.get("temperature", 1.0)
        top_p = params.get("top_p", 1.0)
        freq_penalty = params.get("frequency_penalty", 0.0)
        pres_penalty = params.get("presence_penalty", 0.0)

        temperature = min(base_temp + (retry_count * 0.1), 1.5)

        if not template: return "Error: No prompt_template"
        try:
            formatted_prompt = template.format(**current_row_context)
            
            if avoid_values and len(avoid_values) > 0:
                avoid_list_str = ", ".join(list(avoid_values)[-15:])
                formatted_prompt += f"\n\nCONSTRAINT: Value MUST be unique. DO NOT use: {avoid_list_str}."
                if retry_count > 2:
                     formatted_prompt += " Be inventive."

        except Exception as e:
            return f"Error formatting prompt: {str(e)}"

        try:
            system_msg = "You are a data generator. Output ONE single value. No formatting, no quotes."
            
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": formatted_prompt}
                ],
                temperature=temperature,
                max_tokens=60,
                top_p=top_p,
                frequency_penalty=freq_penalty,
                presence_penalty=pres_penalty
            )
            return response.choices[0].message.content.strip().strip('"')
            
        except Exception as e:
            return f"OpenAI Error: {str(e)}"

    def _resolve_generation_order(self, tables: List[Any]) -> List[Any]:
        """
        Sorts tables based on their foreign key dependencies to ensure that
        foreign key constraints are respected during generation.
        """
        id_to_table = {t.id: t for t in tables}
        dependencies = {t.id: set() for t in tables}

        for table in tables:
            for field in table.fields:
                if field.type == "foreign_key":
                    target_id = field.params.get("table_id")
                    if target_id and target_id in id_to_table and target_id != table.id:
                        dependencies[table.id].add(target_id)
        
        ordered_tables = []
        
        while dependencies:
            ready_tables = [t_id for t_id, deps in dependencies.items() if not deps]
            
            if not ready_tables:
                print("Warning: Circular dependency detected! Generation might fail for some keys.")
                remaining = list(dependencies.keys())
                for t_id in remaining:
                    ordered_tables.append(id_to_table[t_id])
                break

            ready_tables.sort()

            for t_id in ready_tables:
                ordered_tables.append(id_to_table[t_id])
                del dependencies[t_id]
            
            for t_id in dependencies:
                dependencies[t_id] = dependencies[t_id] - set(ready_tables)

        return ordered_tables

    def generate(self, request: GeneratorRequest) -> Dict[str, List[Dict[str, Any]]]:
        generated_tables_data: Dict[str, List[Dict[str, Any]]] = {}
        
        table_id_to_name = {t.id: t.name for t in request.tables}

        ordered_tables = self._resolve_generation_order(request.tables)
        print(f"Generation Order: {[t.name for t in ordered_tables]}")

        for table in ordered_tables:
            table_rows = []
            unique_tracker: Dict[str, set] = {}

            for field in table.fields:
                if field.is_unique:
                    unique_tracker[field.name] = set()

            for _ in range(table.rows_count):
                row_data = {}
                if request.config.global_context:
                    row_data["global_context"] = request.config.global_context

                for field in table.fields:
                    max_retries = 10 
                    attempts = 0
                    value = None
                    current_attempts_avoid_list = set()
                    
                    if field.is_unique:
                        current_attempts_avoid_list.update(unique_tracker[field.name])
                    
                    while attempts < max_retries:
                        if field.type == "faker":
                            value = self._generate_faker_value(field.params)
                        elif field.type == "llm":
                            value = self._generate_llm_value(field.params, row_data, current_attempts_avoid_list, attempts)
                        elif field.type == "distribution":
                            value = self._generate_distribution_value(field.params)
                        elif field.type == "foreign_key":
                            value = self._generate_foreign_key_value(field.params, generated_tables_data)
                        else:
                            value = None

                        if field.is_unique:
                            if value not in unique_tracker[field.name]:  
                                unique_tracker[field.name].add(value)
                                break
                            else:
                                attempts += 1
                                current_attempts_avoid_list.add(value)
                        else:
                            break 

                    if field.is_unique and attempts == max_retries:
                        value = f"ERROR: Uniqueness failed for {field.name}"

                    row_data[field.name] = value
                
                if "global_context" in row_data:
                    del row_data["global_context"]

                table_rows.append(row_data)
            
            generated_tables_data[table.id] = table_rows

        final_output = {}
        for t_id, rows in generated_tables_data.items():
            t_name = table_id_to_name.get(t_id, t_id)
            final_output[t_name] = rows

        return final_output