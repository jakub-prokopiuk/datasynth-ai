from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

FieldType = Literal["faker", "llm", "distribution"]

class FieldSchema(BaseModel):
    name: str = Field(..., description="Name of field in the resulting dataset")
    type: FieldType = Field(..., description="Type of generator: faker, llm or distribution")
    params: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)

class GeneratorConfig(BaseModel):
    job_name: str = "My Dataset"
    rows_count: int = Field(10, ge=1, le=100)
    global_context: Optional[str] = None
    output_format: Literal["json", "csv", "sql"] = "json"

class GeneratorRequest(BaseModel):
    config: GeneratorConfig
    schema_structure: List[FieldSchema]

    class Config:
        schema_extra = {
            "example": {
                "config": {
                    "job_name": "Test Users",
                    "rows_count": 2,
                    "global_context": "Sklep obuwniczy"
                },
                "schema_structure": [
                    {"name": "id", "type": "faker", "params": {"method": "uuid4"}},
                    {"name": "name", "type": "faker", "params": {"method": "name"}},
                    {
                        "name": "bio", 
                        "type": "llm", 
                        "dependencies": ["name"],
                        "params": {"prompt_template": "Napisz bio dla {name}"}
                    }
                ]
            }
        }