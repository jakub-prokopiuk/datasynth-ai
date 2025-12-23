from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

FieldType = Literal["faker", "llm", "distribution", "foreign_key"]

class FieldSchema(BaseModel):
    name: str = Field(..., description="Name of field in the resulting dataset")
    type: FieldType = Field(..., description="Type of generator")
    params: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)
    is_unique: bool = Field(False, description="Ensure values are unique within the column")

class TableSchema(BaseModel):
    id: str = Field(..., description="Unique internal ID of the table (used for referencing)")
    name: str = Field(..., description="Name of the table")
    rows_count: int = Field(10, ge=1, le=1000)
    fields: List[FieldSchema]

class GeneratorConfig(BaseModel):
    job_name: str = "My Database"
    global_context: Optional[str] = None
    output_format: Literal["json", "csv", "sql"] = "json"

class GeneratorRequest(BaseModel):
    config: GeneratorConfig
    tables: List[TableSchema]

    class Config:
        schema_extra = {
            "example": {
                "config": {
                    "job_name": "E-commerce DB",
                    "output_format": "json"
                },
                "tables": [
                    {
                        "id": "t_users",
                        "name": "users",
                        "rows_count": 5,
                        "fields": [
                            {"name": "id", "type": "faker", "params": {"method": "uuid4"}}
                        ]
                    }
                ]
            }
        }